// Import the database connection
const db = require("../db");

/**
 * Controller: groupsGET
 * Route: GET /groups
 * Purpose: Fetch all groups that the currently authenticated user is a member of
 * Middleware: Protected by verifyToken (req.user is set)
 */
const groupsGET = (req, res) => {
  // Get the user ID from the decoded JWT token set by verifyToken middleware
  const userId = req.user.user_id;

  // SQL query to fetch group_id and group_name for groups the user belongs to
  const query = `
    SELECT g.group_id, g.group_name
    FROM chat_groups g
    JOIN chat_group_members m ON g.group_id = m.group_id
    WHERE m.user_id = ?
  `;

  // Execute the query with the user ID as a parameter
  db.execute(query, [userId], (err, groups) => {
    if (err) {
      // If there's a database error, return a 500 response
      return res.status(500).json({
        message: "Server error while fetching groups",
        error: err.message,
      });
    }

    // Return the list of groups as JSON
    res.json({ groups });
  });
};

/**
 * Controller: groupsPOST
 * Route: POST /groups
 * Purpose: Create a new group and automatically add the creator as an admin
 * Middleware: Protected by verifyToken (req.user is set)
 */
const groupsPOST = (req, res) => {
  // Get the authenticated user's ID from the JWT payload
  const userId = req.user.user_id;

  // Extract group_name from the request body
  const { group_name } = req.body;

  // Input validation: group name is required
  if (!group_name) {
    return res.status(400).json({ message: "Group name is required" });
  }

  // -------------------------------------
  // Step 1: Insert the new group into chat_groups table
  // -------------------------------------
  const createGroupQuery = `
    INSERT INTO chat_groups (group_name, created_by)
    VALUES (?, ?)
  `;

  db.execute(createGroupQuery, [group_name, userId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server error while creating group",
        error: err.message,
      });
    }

    // Get the newly inserted group's ID
    const groupId = result.insertId;

    // -------------------------------------
    // Step 2: Add the creator as an admin member of the group
    // -------------------------------------
    const addAdminQuery = `
      INSERT INTO chat_group_members (group_id, user_id, is_admin)
      VALUES (?, ?, TRUE)
    `;

    db.execute(addAdminQuery, [groupId, userId], (err2) => {
      if (err2) {
        return res.status(500).json({
          message: "Server error while adding creator as admin",
          error: err2.message,
        });
      }

      // Group successfully created and creator added as admin
      res.status(201).json({
        message: "Group created successfully",
        groupId: groupId,
      });
    });
  });
};

/**
 * Controller: groupinvitePOST
 * Route: POST /groups/:groupId/invite
 * Purpose: Validate and prepare to invite a user to a group by their username
 * Middleware: Protected by verifyToken (req.user is set)
 */
const groupinvitePOST = (req, res) => {
  // Extract groupId from route params and parse it as an integer
  const groupId = parseInt(req.params.groupId);

  // Extract username from request body (the user to be invited)
  const { username } = req.body;

  // Get the ID of the user sending the invite (from JWT)
  const inviterId = req.user.user_id;

  // Input validation: username is required
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  // -------------------------------------
  // Step 1: Verify that the inviter is an admin in the group
  // -------------------------------------
  const checkAdminQuery = `
    SELECT is_admin FROM chat_group_members
    WHERE group_id = ? AND user_id = ?
  `;

  db.execute(checkAdminQuery, [groupId, inviterId], (err, adminResults) => {
    if (err) {
      return res.status(500).json({
        message: "Server error while checking admin privileges",
        error: err.message,
      });
    }

    // Check if inviter is actually an admin
    const isAdmin = adminResults.length > 0 && adminResults[0].is_admin == 1;

    if (!isAdmin) {
      return res.status(403).json({
        message: "Only admins can invite users to the group",
      });
    }

    // -------------------------------------
    // Step 2: Get the user_id of the user to be invited by username
    // -------------------------------------
    const findUserQuery = `
      SELECT user_id FROM chat_users WHERE username = ?
    `;

    db.execute(findUserQuery, [username], (err2, userResults) => {
      if (err2) {
        return res.status(500).json({
          message: "Server error while fetching user info",
          error: err2.message,
        });
      }

      // If user doesn't exist
      if (userResults.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userIdToInvite = userResults[0].user_id;

      // ✅ This is just preparation; the actual invite (or membership insert) will happen in another step
      res.status(200).json({
        message: "Invite ready to send",
        user_id: userIdToInvite,
      });
    });
  });
};


/**
 * Controller: groupsmessageGET
 * Route: GET /groups/:groupId/messages
 * Purpose: Retrieve the latest messages for a group if the user is a member.
 * Middleware: Protected by verifyToken (req.user is set)
 */
const groupsmessageGET = (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.user_id;

  const checkMembershipQuery = `
    SELECT 1 FROM chat_group_members
    WHERE group_id = ? AND user_id = ?
  `;

  db.execute(checkMembershipQuery, [groupId, userId], (err, membership) => {
    if (err) {
      return res.status(500).json({
        message: "Server error while checking group membership",
        error: err.message,
      });
    }

    if (membership.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fetchMessagesQuery = `
      SELECT 
        m.message_text, 
        m.sent_at,
        m.sender_id,
        u.username,
        m.file_url,     -- added file URL
        m.file_type,    -- added file type
        m.file_name     -- added original file name
      FROM chat_messages m
      JOIN chat_users u ON m.sender_id = u.user_id
      WHERE m.group_id = ?
      ORDER BY m.sent_at ASC
      LIMIT 50
    `;

    db.execute(fetchMessagesQuery, [groupId], (err2, messages) => {
      if (err2) {
        return res.status(500).json({
          message: "Server error while fetching messages",
          error: err2.message,
        });
      }

      res.json({ messages });
    });
  });
};



/**
 * Controller: groupsmessagePOST
 * Route: POST /groups/:groupId/messages
 * Purpose: Send a message to a group if the user is a member.
 * Middleware: Protected by verifyToken (req.user is set)
 */

const groupsmessagePOST = (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.user_id;

  // Extract all possible fields from request body
  const { message_text, file_url, file_type, file_name } = req.body;

  // Validate that there is either a message or a file URL
  if (!message_text && !file_url) {
    return res.status(400).json({ message: "Message text or file URL is required" });
  }

  // Check membership as before
  const checkMembershipQuery = `
    SELECT 1 FROM chat_group_members
    WHERE group_id = ? AND user_id = ?
  `;

  db.execute(checkMembershipQuery, [groupId, userId], (err, membership) => {
    if (err) {
      return res.status(500).json({
        message: "Server error while checking group membership",
        error: err.message,
      });
    }

    if (membership.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Insert query with file columns
    const insertMessageQuery = `
      INSERT INTO chat_messages (group_id, sender_id, message_text, file_url, file_type, file_name, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    db.execute(
      insertMessageQuery,
      [groupId, userId, message_text || null, file_url || null, file_type || null, file_name || null],
      (err2, result) => {
        if (err2) {
          return res.status(500).json({
            message: "Server error while inserting message",
            error: err2.message,
          });
        }

        res.status(201).json({
          message: "Message sent",
          messageId: result.insertId,
        });
      }
    );
  });
};



// const userGET = (req, res) => {
//   // Extract current user's ID from JWT-authenticated request
//   const currentUserId = req.user.user_id;

//   // SQL: Select all users except the one making the request
//   const query = `
//     SELECT user_id, username
//     FROM chat_users
//     WHERE user_id != ?
//   `;

//   db.execute(query, [currentUserId], (err, users) => {
//     if (err) {
//       // Return a server error if the query fails
//       return res.status(500).json({
//         message: "Server error",
//         error: err.message
//       });
//     }

//     // Return the list of users (excluding the requester)
//     res.json({ users });
//   });
// };


/**
 * Controller: groupmemberDELETE
 * Route: DELETE /groups/:groupId/members/:userId
 * Purpose: Allows an admin to remove a member from a group.
 * Middleware: Requires authentication (req.user must be populated)
 */

const groupmemberDELETE = (req, res) => {
  const groupId = parseInt(req.params.groupId);        // ID of the group
  const userIdToRemove = parseInt(req.params.userId);  // ID of the user to remove
  const requesterId = req.user.user_id;                // ID of the authenticated user making the request

  // ✅ Validate input
  if (!userIdToRemove) {
    return res.status(400).json({ message: "User ID to remove is required" });
  }

  // Step 1: Check if requester is an admin of the group
  db.execute(
    `SELECT is_admin FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
    [groupId, requesterId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Server error",
          error: err.message
        });
      }

      const isAdmin = results.length > 0 && results[0].is_admin == 1;
      if (!isAdmin) {
        return res.status(403).json({ message: "Only admins can remove users" });
      }

      // Step 2: Proceed to remove the user from the group
      db.execute(
        `DELETE FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
        [groupId, userIdToRemove],
        (err2, result) => {
          if (err2) {
            return res.status(500).json({
              message: "Server error",
              error: err2.message
            });
          }

          if (result.affectedRows === 0) {
            // User was not found in the group
            return res.status(404).json({ message: "User not found in the group" });
          }

          // Success: user removed
          return res.json({ message: "User removed from group" });
        }
      );
    }
  );
};




// const groupmemberpromotePOST = (req, res) => {
//   const { userId } = req.body;                          // User ID to promote
//   const groupId = parseInt(req.params.groupId);         // Group ID from route
//   const currentUserId = req.user.user_id;               // Requester (should be an admin)

//   if (!userId) {
//     return res.status(400).json({ message: "User ID is required" });
//   }

//   // Step 1: Verify current user is an admin of the group
//   db.execute(
//     `SELECT is_admin FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
//     [groupId, currentUserId],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ message: "Server error", error: err.message });
//       }

//       const isAdmin = results.length > 0 && results[0].is_admin == 1;
//       if (!isAdmin) {
//         return res.status(403).json({ message: "Not authorized" });
//       }

//       // Step 2: Promote the specified user to admin
//       db.execute(
//         `UPDATE chat_group_members SET is_admin = TRUE WHERE group_id = ? AND user_id = ?`,
//         [groupId, userId],
//         (err2, result) => {
//           if (err2) {
//             return res.status(500).json({ message: "Error promoting user", error: err2.message });
//           }

//           if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "User not found in group" });
//           }

//           return res.json({ message: "User promoted to admin" });
//         }
//       );
//     }
//   );
// };



// const groupmemberremovePOST = (req, res) => {
//   const { userId } = req.body;                  // User ID to remove
//   const groupId = parseInt(req.params.groupId); // Group ID from route
//   const currentUserId = req.user.user_id;       // Requester (should be an admin)

//   if (!userId) {
//     return res.status(400).json({ message: "User ID is required" });
//   }

//   // Step 1: Verify current user is an admin of the group
//   db.execute(
//     `SELECT is_admin FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
//     [groupId, currentUserId],
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ message: "Server error", error: err.message });
//       }

//       const isAdmin = results.length > 0 && results[0].is_admin == 1;
//       if (!isAdmin) {
//         return res.status(403).json({ message: "Not authorized" });
//       }

//       // Step 2: Remove the specified user from the group
//       db.execute(
//         `DELETE FROM chat_group_members WHERE group_id = ? AND user_id = ?`,
//         [groupId, userId],
//         (err2, result) => {
//           if (err2) {
//             return res.status(500).json({ message: "Error removing user", error: err2.message });
//           }

//           if (result.affectedRows === 0) {
//             return res.status(404).json({ message: "User not found in the group" });
//           }

//           return res.json({ message: "User removed from group" });
//         }
//       );
//     }
//   );
// };


/**
 * Controller: groupmemberGET
 * Route: GET /groups/:groupId/members
 * Purpose: Retrieve all members of a group along with their admin status.
 * Returns whether the requesting user is an admin of the group.
 * Middleware: Requires authentication (req.user must be populated)
 */

const groupmemberGET = (req, res) => {
  const groupId = parseInt(req.params.groupId); // Group ID from route params
  const currentUserId = req.user.user_id;       // Requesting user's ID

  // Step 1: Query all members of the group with their admin status and usernames
  db.execute(
    `SELECT u.user_id, u.username, m.is_admin 
     FROM chat_group_members m
     JOIN chat_users u ON m.user_id = u.user_id
     WHERE m.group_id = ?`,
    [groupId],
    (err, members) => {
      if (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
      }

      // Step 2: Determine if the current user is an admin in this group
      const isAdmin = members.some(
        (member) => member.user_id === currentUserId && member.is_admin === 1
      );

      // Step 3: Return the list of members and admin status of the requester
      res.json({ members, isAdmin });
    }
  );
};


// const userstatusGET = (req, res) => {
//   // Query all users from the database
//   db.query("SELECT user_id, username FROM users", (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "Database error" });
//     }

//     // Map users to include their online status
//     const usersWithStatus = results.map((user) => ({
//       user_id: user.user_id,
//       username: user.username,
//       online: onlineUsers.has(user.user_id), // Check if user_id is in onlineUsers set
//     }));

//     // Return the list of users with online status
//     res.json({ users: usersWithStatus });
//   });
// };


module.exports = {
  groupsGET,
  groupsPOST,
  groupinvitePOST,
  groupsmessageGET,
  groupsmessagePOST,
  groupmemberDELETE,
  groupmemberGET 
};
