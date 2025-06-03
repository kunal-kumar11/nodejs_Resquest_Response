// Load environment variables from .env file
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken"); // Used for verifying JWT tokens
const db = require("./db"); // Database connection
const authRoutes = require("./routes/auth"); // Authentication routes
const groupRoutes = require("./routes/group"); // Group-related routes

const onlineUsers = require("./utils/onlineUsers"); // Utility to manage online users

const app = express();
const PORT = 5000; // Server port

// Middleware
app.use(express.static("public")); // Serve static files from 'public' directory
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Route handling
app.use("/api/auth", authRoutes);     // Routes for user authentication (login/register)
app.use("/api/groups", groupRoutes);  // Routes for group creation, updates, etc.

// Serve a basic HTML page for testing (register page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Create an HTTP server and bind it with socket.io for WebSocket support
const server = http.createServer(app);

// Initialize socket.io on top of the HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins (adjust in production)
    methods: ["GET", "POST"], // Allowed HTTP methods
  },
});
const socketMap = {}; // userId -> socket.id

// Socket.IO authentication middleware
io.use((socket, next) => {
  // Extract token from the client's handshake (authorization phase)
  const token = socket.handshake.auth.token;

  // If no token is provided, reject the connection
  if (!token) {
    return next(new Error('Authentication error: token required'));
  }

  // Verify the token using JWT
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return next(new Error('Authentication error: invalid token'));
    }

    // Token is valid - attach decoded user info to the socket
    console.log('Decoded user:', decoded);
    socket.user = decoded;

    // Allow the socket connection to proceed
    next();
  });
});

io.on('connection', (socket) => {
  const user = socket.user;

  /** ------------------------------------------
   * 🔗 1. Register User
   ------------------------------------------- */
  socket.on("register-user", (userId) => {
    socketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Add to online users and notify all
  onlineUsers.set(Number(user.user_id), {
    socketId: socket.id,
    username: user.username
  });
  sendOnlineOffline();

  /** ------------------------------------------
   * 🚪 2. Join Group Room
   ------------------------------------------- */
  socket.on("join-group", (groupId) => {
    socket.join(`group_${groupId}`);

    db.query(
      "SELECT group_name FROM chat_groups WHERE group_id = ?",
      [groupId],
      (err, results) => {
        if (err || results.length === 0) {
          console.error("Failed to get group name:", err);
          return;
        }
        // Group joined successfully
      }
    );

    // Notify group to refresh member list
    socket.to(`group_${groupId}`).emit("refresh-group-members", { groupId });
  });

  /** ------------------------------------------
   * ✉️ 3. Send Message to Group
   ------------------------------------------- */
socket.on("send-message", (data) => {
  const {
    groupId,
    message_text,
    fileType,
    fileName,
    username,
    user_id,
    type, // 'file' or 'text'
  } = data;

  // Convert frontend fields to backend-expected ones
  const file_url = type === "file" ? message_text : null;
  const file_type = type === "file" ? fileType : null;
  const file_name = type === "file" ? fileName : null;

  console.log("✉️ Message received on backend");
  console.log("➡️ From user:", username || "Unknown");
  console.log("➡️ Group ID:", groupId);
  console.log("➡️ Message text:", message_text || "No text");
  console.log("➡️ File URL:", file_url || "No file");
  console.log("➡️ File Type:", file_type || "None");

  // Broadcast to the group room
  io.to(`group_${groupId}`).emit("receive-message", {
    groupId,
    user_id,
    username,
    message_text,
    file_url,
    file_type,
    file_name,
    timestamp: new Date().toISOString(),
  });

  console.log(`📤 Emitted 'receive-message' to group_${groupId}`);
});





  /** ------------------------------------------
   * ➖ 4. Remove User from Group
   ------------------------------------------- */
  socket.on("remove-user-from-group", ({ groupId, userId }) => {
    db.query(
      "DELETE FROM chat_group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
      (err, result) => {
        if (err) {
          console.error("Remove user error:", err);
          return;
        }

        console.log(`User ${userId} removed from group ${groupId}`);

        // Notify all group users and the remover
        io.to(`group_${groupId}`).emit("refresh-group-members", { groupId });
        socket.emit("refresh-group-members", { groupId });
      }
    );
  });

  /** ------------------------------------------
   * 👑 5. Make User Admin
   ------------------------------------------- */
  socket.on("make-user-admin", ({ groupId, userId }) => {
    db.query(
      "UPDATE chat_group_members SET is_admin = true WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
      (err, result) => {
        if (err || result.affectedRows === 0) {
          console.error("Make admin failed:", err || "User not in group");
          return;
        }

        console.log(`User ${userId} promoted to admin in group ${groupId}`);
        io.to(`group_${groupId}`).emit("refresh-group-members", { groupId });
      }
    );
  });

  /** ------------------------------------------
   * ✉️ 6. Invite User to Group
   ------------------------------------------- */
  socket.on('invite-user', ({ groupId, toUserId }) => {
    if (!user || !user.username || !user.user_id) {
      return socket.emit('invite-error', { message: 'Unauthorized user' });
    }

    const invitedUser = onlineUsers.get(toUserId);
    if (!invitedUser) {
      socket.emit('invite-error', { message: 'User is not online' });
      return;
    }

    db.query('SELECT group_name FROM chat_groups WHERE group_id = ?', [groupId], (err, results) => {
      if (err || !results.length) {
        return socket.emit('invite-error', { message: 'Group not found or DB error' });
      }

      const groupName = results[0].group_name;

      io.to(invitedUser.socketId).emit('group-invite', {
        from: user.username,
        groupId,
        groupName,
      });
    });
  });

  /** ------------------------------------------
   * 🗑️ 7. Delete Group (Only Admins)
   ------------------------------------------- */
  socket.on("delete-group", ({ groupId, userId }) => {
    db.query(
      "SELECT is_admin FROM chat_group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId],
      (err, results) => {
        if (err || results.length === 0 || !results[0].is_admin) {
          console.error("Permission denied or not admin");
          return;
        }

        db.query(
          "SELECT user_id FROM chat_group_members WHERE group_id = ?",
          [groupId],
          (err, rows) => {
            if (err) {
              console.error("Failed to fetch members:", err);
              return;
            }

            

            db.query("DELETE FROM chat_groups WHERE group_id = ?", [groupId], (err) => {
              if (err) {
                console.error("Group deletion failed:", err);
                return;
              }

              console.log(`Group ${groupId} deleted by user ${userId}`);

        
            });
          }
        );
      }
    );
  });

  /** ------------------------------------------
   * ⬇️ 8. Demote Admin
   ------------------------------------------- */
  socket.on("demote-admin", ({ groupId, userId }) => {
    const requesterId = user.user_id;

    db.query(
      `SELECT is_admin FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, requesterId],
      (err, results) => {
        if (err || results.length === 0 || !results[0].is_admin) {
          console.log("Not authorized to demote admin");
          return;
        }

        db.query(
          `UPDATE chat_group_members SET is_admin = false WHERE group_id = ? AND user_id = ?`,
          [groupId, userId],
          (err2) => {
            if (err2) {
              console.error("Demote error:", err2);
              return;
            }

            console.log(`User ${userId} demoted from admin in group ${groupId}`);
            io.to(`group_${groupId}`).emit("refresh-group-members", { groupId });
          }
        );
      }
    );
  });

  /** ------------------------------------------
   * ✅ 9. Respond to Group Invite
   ------------------------------------------- */
  socket.on('respond-to-invite', ({ groupId, accepted, groupName }) => {
    if (!user || typeof groupId !== 'number' || typeof accepted !== 'boolean') {
      return socket.emit('invite-error', { message: 'Invalid request' });
    }

    if (!accepted) {
      console.log(`${user.username} rejected invite to group ${groupId}`);
      return;
    }

    // Check membership
    db.query(
      `SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, user.user_id],
      (checkErr, checkResults) => {
        if (checkErr) {
          return socket.emit('invite-error', { message: 'DB error' });
        }

        if (checkResults.length > 0) {
          socket.join(`group_${groupId}`);
          socket.emit('group-joined', { groupId });
          return;
        }

        // Add user to group
        db.query(
          `INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)`,
          [groupId, user.user_id],
          (insertErr) => {
            if (insertErr) {
              return socket.emit('invite-error', { message: 'Join failed' });
            }

            socket.join(`group_${groupId}`);
            socket.emit('group-joined', { groupId, groupName });
          }
        );
      }
    );
  });

  /** ------------------------------------------
   * ❌ 10. Disconnect Handler
   ------------------------------------------- */
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${user.username} (user_id: ${user.user_id})`);
    onlineUsers.delete(Number(user.user_id));
    sendOnlineOffline();
  });
});

// 🔁 Function to emit the current online/offline status of all users
function sendOnlineOffline() {
  // Query all users from the chat_users table
  db.query('SELECT user_id, username FROM chat_users', (err, results) => {
    if (err) {
      console.error('❌ Error fetching all users:', err);
      return;
    }

    // Create a list of users with their online status
    const users = results.map(user => ({
      user_id: user.user_id,
      username: user.username,
      online: onlineUsers.has(user.user_id), // true if user is currently online
    }));

    // Emit the user status list to all connected clients
    io.emit('user-status-list', users);
  });
}

// 🚀 Start the server on the specified port
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
