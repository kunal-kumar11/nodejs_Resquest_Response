// ========== 1. Token & User Initialization ==========
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const appendUsername = document.getElementById("appendUsername");

appendUsername.innerHTML = `<h2>Hello ${username}</h2>`;

console.log("Loaded token from localStorage:", token);
console.log("Loaded username from localStorage:", username);

let currentGroupId = null;
let currentUserId = null;

const decodedToken = jwt_decode(token);
currentUserId = decodedToken.userId || decodedToken.id || decodedToken.user_id;

console.log("here is current userid" + currentUserId);
console.log("token of users" + token);

const SUPABASE_URL = "";
const SUPABASE_ANON_KEY =
  ""; // This is a long string

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



document.getElementById("uploadBtn").onclick = async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Please select a file");

  const filePath = `group_${currentGroupId}/${Date.now()}_${file.name}`;

  // 🔼 Upload to Supabase
  const { data, error } = await supabase.storage
    .from("chat-files")
    .upload(filePath, file);

  if (error) {
    console.error("❌ Upload failed:", error.message);
    return;
  }

  const { publicUrl } = supabase.storage
    .from("chat-files")
    .getPublicUrl(filePath).data;

  console.log("✅ File uploaded. Public URL:", publicUrl);

  try {
    // ✅ Save to DB via POST request
    const res = await axios.post(
      `/api/groups/${currentGroupId}/messages`,
      {
        message_text: "files", // text is empty
        file_url: publicUrl, // ✅ this is critical
        file_name: file.name,
        file_type: file.type,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("✅ File message saved to DB:", res.data);

    // ✅ Emit via socket
    socket.emit("send-message", {
      groupId: currentGroupId,
      user_id: currentUserId,
      username: username,
      message_text: publicUrl, // used for rendering
      type: "file", // used for UI logic
      fileType: file.type,
      fileName: file.name,
    });

    // Clear file input
    document.getElementById("fileInput").value = "";
  } catch (err) {
    console.error("❌ Error saving file message:", err);
    alert("Failed to save file message");
  }
};

// ========== 2. Socket Connection ==========
const socket = io("http://localhost:5000", {
  auth: { token: token },
});

socket.on("connect", () => {
  console.log("🟢 Socket connected with ID:", socket.id);
});

socket.emit("register-user", currentUserId);

// ========== 3. DOM Event Listeners ==========
document.addEventListener("DOMContentLoaded", () => {
  socket.on("receive-message", (data) => {
    const { username, user_id, message_text, file_url, file_type, file_name } =
      data;

    const sender = user_id === currentUserId ? "You" : username || "Unknown";
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (file_url) {
      // Show file link (can add preview logic based on type)
      messageDiv.innerHTML = `
        ${sender}:<br>
        📎 <a href="${file_url}" target="_blank">${
        file_name || "Download File"
      }</a>
      `;
    } else {
      // Regular text message
      messageDiv.innerHTML = `${sender}:${message_text}`;
    }

    document.getElementById("messages").appendChild(messageDiv);
    // Scroll to bottom
    document.getElementById("messages").scrollTop =
      document.getElementById("messages").scrollHeight;
  });
});

// ========== 4. Logout ==========
document.getElementById("logout-button").onclick = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("🔌 WebSocket disconnected.");
  }
  console.log("its work");
  localStorage.removeItem("token");
  window.location.href = "/login.html";
  console.log("rewrewrer");
};

// ========== 5. Sending Message ==========
document.getElementById("send-btn").onclick = async () => {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  console.log("📝 Attempting to send message:", message);
  console.log("📌 Current Group ID:", currentGroupId);

  if (!message || !currentGroupId) {
    alert("Select a group and enter a message");
    console.warn("⚠️ Message not sent - missing group or empty message");
    return;
  }

  try {
    const res = await axios.post(
      `/api/groups/${currentGroupId}/messages`,
      { message_text: message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Message saved to DB:", res.data);
    input.value = "";
    socket.emit("send-message", {
      groupId: currentGroupId,
      message_text: message,
      user_id: currentUserId, // 🔼 ADD THIS
      username: username, // 🔼 AND THIS
      type: "text", // 🔼 Optional: for consistency
    });

    console.log("📤 Message emitted via socket");
  } catch (err) {
    alert("Failed to send message");
    console.error("❌ Error sending message:", err);
  }
};

// ========== 6. Socket Event Handlers ==========
socket.on("group-user-removed", ({ groupId, userId }) => {
  console.log("helllo ji group user");
  loadGroupMembers(groupId);
});

socket.on("group-invite", ({ from, groupId, groupName }) => {
  console.log("📥 Received group invite");
  showInvitePopup(from, groupId, groupName);
});

socket.on("group-joined", ({ groupId, groupName }) => {
  console.log(
    "✅ -------------------------group-joined event received for group:",
    groupId
  );
  if (typeof loadGroups === "function") loadGroups();
  if (typeof loadGroupMembers === "function") loadGroupMembers(groupId);
  selectGroup(groupId, groupName);
});

socket.on("group-member-updated", ({ groupId, username }) => {
  console.log(`👥 ${username} joined group ${groupId}`);
  loadGroupMembers(groupId);
});

socket.on("user-status-list", (users) => {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  users.forEach((user) => {
    if (user.user_id === currentUserId) return;
    const li = document.createElement("li");
    li.innerHTML = `${user.username} <span style="color: ${
      user.online ? "green" : "red"
    }">(${user.online ? "online" : "offline"})</span>`;
    userList.appendChild(li);
  });
});

socket.on("refresh-group-members", ({ groupId }) => {
  console.log("Refreshing group members for group:", groupId);
  loadGroupMembers(groupId);
});

// ========== 7. UI & Modal Functions ==========
function showInvitePopup(from, groupId, groupName) {
  const popup = document.getElementById("invitePopup");
  const text = document.getElementById("inviteText");

  if (!popup || !text) {
    console.error("❌ Invite popup elements not found.");
    return;
  }

  text.textContent = `${from} invited you to join "${groupName}"`;
  popup.style.display = "block";

  document.getElementById("acceptBtn").onclick = () => {
    socket.emit("respond-to-invite", { groupId, accepted: true, groupName });
    popup.style.display = "none";
  };

  document.getElementById("rejectBtn").onclick = () => {
    socket.emit("respond-to-invite", { groupId, accepted: false, groupName });
    popup.style.display = "none";
  };
}

// ========== 8. Group Management ==========
async function loadGroups() {
  try {
    const res = await axios.get("/api/groups", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const groups = res.data.groups;
    const groupList = document.getElementById("group-list");
    groupList.innerHTML = "";

    groups.forEach((group) => {
      const li = document.createElement("li");
      li.textContent = group.group_name;
      li.setAttribute("data-group-id", group.group_id);
      li.style.cursor = "pointer";
      li.onclick = () => selectGroup(group.group_id, group.group_name);
      groupList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading groups", err);
  }
}

async function loadGroupMembers(groupId) {
  try {
    const res = await axios.get(`/api/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { members, isAdmin } = res.data;
    console.log("Loaded members:", members);
    console.log("Is current user admin?", isAdmin);

    const membersList = document.getElementById("group-members-list");
    const groupMembersSection = document.getElementById(
      "group-members-section"
    );
    const inviteSection = document.getElementById("invite-section");

    membersList.innerHTML = "";
    groupMembersSection.style.display = "block";
    inviteSection.style.display = isAdmin ? "block" : "none";

    members.forEach((member) => {
      const li = document.createElement("li");
      li.textContent = `${member.username}${member.is_admin ? " (Admin)" : ""}`;

      if (isAdmin && member.user_id !== currentUserId) {
        const controls = document.createElement("span");
        controls.style.marginLeft = "10px";

        if (member.is_admin) {
          const demoteBtn = document.createElement("button");
          demoteBtn.textContent = "Demote Admin";
          demoteBtn.onclick = () => {
            socket.emit("demote-admin", { groupId, userId: member.user_id });
          };
          controls.appendChild(demoteBtn);
        } else {
          const makeAdminBtn = document.createElement("button");
          makeAdminBtn.textContent = "Make Admin";
          makeAdminBtn.onclick = () => {
            socket.emit("make-user-admin", { groupId, userId: member.user_id });
          };

          controls.appendChild(makeAdminBtn);
        }

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => {
          socket.emit("remove-user-from-group", {
            groupId,
            userId: member.user_id,
          });
          const listItem = removeBtn.closest("li");
          if (listItem) listItem.remove();
        };

        controls.appendChild(removeBtn);
        li.appendChild(controls);
      }

      membersList.appendChild(li);
    });

    const deleteBtnContainer = document.getElementById(
      "delete-group-container"
    );
    deleteBtnContainer.innerHTML = "";

    if (isAdmin) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Group";
      deleteBtn.style.marginTop = "10px";
      deleteBtn.onclick = () => {
        document.getElementById("delete-group-modal").style.display = "block";
      };
      deleteBtnContainer.appendChild(deleteBtn);
    }
  } catch (err) {
    console.error("Failed to load group members:", err);
  }
}

function setInputState(enabled) {
  document.getElementById("message-input").disabled = !enabled;
  document.getElementById("uploadBtn").disabled = !enabled;
  document.getElementById("send-btn").disabled = !enabled;
  document.getElementById("fileInput").disabled=!enabled
}

// Call this function when a group is selected
function selectGroup(groupId, groupName) {
  currentGroupId = groupId;
  document.getElementById("group-title").textContent = groupName;
  document.getElementById("messages").innerHTML = "";
  loadMessages(groupId);
  loadGroupMembers(groupId);
  setInputState(true); // Enable inputs since a group is selected
}

// Initial state: disable all inputs
setInputState(false);

async function loadMessages(groupId) {
  try {
    socket.emit("join-group", groupId);
    console.log("🔗 Joined group room:", groupId);

    const res = await axios.get(`/api/groups/${groupId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const messages = res.data.messages;
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    messages.forEach((msg) => {
      const p = document.createElement("p");
      const sender =
        String(msg.sender_id) === String(currentUserId) ? "You" : msg.username;

      // Check if it's a file message
      if (msg.file_url) {
        const fileLink = document.createElement("a");
        fileLink.href = msg.file_url;
        fileLink.target = "_blank";
        fileLink.rel = "noopener noreferrer";
        fileLink.textContent = `📎 ${msg.file_name || "Download File"}`;
        p.innerHTML = `${sender}:`;
        p.appendChild(fileLink);
      } else {
        // Text message
        const textNode = document.createTextNode(
          `${sender}: ${msg.message_text}`
        );
        p.appendChild(textNode);
      }

      messagesDiv.appendChild(p);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  } catch (err) {
    console.error("Failed to load messages:", err);
  }
}

document.getElementById("confirm-delete-group").onclick = () => {
  console.log("🔄 Attempting to delete group...");
  console.log("➡️ groupId:", currentGroupId);
  console.log("➡️ userId:", currentUserId);

  socket.emit("delete-group", {
    groupId: currentGroupId,
    userId: currentUserId,
  });

  const groupItem = document.querySelector(
    `[data-group-id="${currentGroupId}"]`
  );
  if (groupItem) groupItem.remove();

  document.getElementById("group-members-section").style.display = "none";
  document.getElementById("delete-group-container").innerHTML = "";
  document.getElementById("messages").innerHTML = `
    <div style="text-align:center; color:#777; padding:20px;">
      Select a group to start chatting
    </div>`;
  document.getElementById("group-title").textContent = "Select a group";
  currentGroupId = null;
  document.getElementById("delete-group-modal").style.display = "none";
};

// ========== 9. Admin Functions ==========
async function inviteUser() {
  const username = document.getElementById("invite-username").value.trim();
  if (!username || !currentGroupId) {
    alert("Select group and enter username to invite");
    return;
  }

  try {
    const res = await axios.post(
      `/api/groups/${currentGroupId}/invite`,
      { username },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { user_id: toUserId } = res.data;
    socket.emit("invite-user", { groupId: currentGroupId, toUserId });

    alert(`Invited ${username} to group`);
    document.getElementById("invite-username").value = "";
    loadGroupMembers(currentGroupId);
  } catch (err) {
    alert(`Invite failed: ${err.response?.data?.message || err.message}`);
    console.error(err);
  }
}

async function removeUser(groupId, userId) {
  try {
    await axios.delete(`/api/groups/${groupId}/members/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadGroupMembers(groupId);
    loadGroups();
  } catch (err) {
    alert("Failed to remove user");
    console.error(err);
  }
}

async function createGroup() {
  const groupName = document.getElementById("new-group-name").value.trim();
  if (!groupName) {
    alert("Group name is required");
    return;
  }

  try {
    await axios.post(
      "/api/groups",
      { group_name: groupName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Group created");
    document.getElementById("new-group-name").value = "";
    loadGroups();
  } catch (err) {
    alert("Failed to create group");
    console.error(err);
  }
}

// ========== 10. Initial Load ==========
window.onload = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwt_decode(token);
    currentUserId =
      decodedToken.userId || decodedToken.id || decodedToken.user_id;
    console.log("✅ Decoded userId:", currentUserId);
    socket.emit("register-user", currentUserId);
  } else {
    console.warn("⚠️ No token found, user not logged in.");
  }

  loadGroups();
};
