# 🖊️ CollabBoard - Real-Time Collaborative Whiteboard

**CollabBoard** is a feature-rich real-time collaborative whiteboard web app that allows multiple users to draw, visualize, and interact on a shared canvas. Built using **Node.js**, **Socket.IO**, **Fabric.js**, **MongoDB**, and **Agora**, this application supports real-time communication, persistent drawing storage, and role-based access control (Admin/Participant).

---

## 🌟 Features Overview

### 🌈 Whiteboard Drawing Tools

* **Pen Tool:** Freehand drawing with smooth strokes
* **Shape Tools:** Draw straight **Lines**, **Rectangles**, and **Circles**
* **Brush Color Selector:** Choose from unlimited color options
* **Brush Size Slider:** Adjustable brush thickness
* **Canvas Background Color Picker**

### ↺ Undo / Redo & Clear

* **Undo/Redo:** Every action on the canvas is recorded for local rollback
* **Clear Canvas:** Remove all content from the canvas

### 📂 Save & Load Drawings (Admin Only)

* **Save Drawings:** Save the canvas as a base64 image to MongoDB
* **View Saved Drawings:** See all drawings uploaded by the current Admin (across rooms)
* **Delete Drawings:** Admin can remove saved drawings

### 💬 Voice Communication

* **Agora Integration:** Real-time group voice calling inside the whiteboard room
* **Voice Controls:** Join, mute/unmute, and leave the call

### 🔑 Authentication with JWT

* **Role-based access:** `Admin` can save/delete; `Participants` can only draw/view
* **Secure Token:** Each user is authenticated via JWT, stored in localStorage

### 🔸 User List with Role

* Shows all connected users in real-time
* Displays `(Admin)` label next to Admin
* All users know who is the current room Admin

### 📆 Persistent Storage

* **MongoDB Atlas:** Stores all saved images with `roomId`, `uploader email`, `name`, and timestamp

### 🔎 URL Security & Encrypted Flow

* **No Query Parameters:** Room details and identity are stored securely in localStorage
* **Direct Access:** Opening `/whiteboard` checks user data in localStorage and joins the room accordingly

### 📅 Session Tracking

* Admin can revisit `/whiteboard` and view all past created room drawings

📽️ Demo
Check out the live demo of CollabBoard in action!
It showcases the real-time collaborative whiteboard, voice chat, drawing with Fabric.js, image save/delete with JWT-auth, and more.

link from which you can download video check demo
https://github.com/kunal-kumar11/nodejs_Resquest_Response/tree/main/Capstone%20Project/demo
Name of video:CollabBoard_Demo_Video
---

## 📖 Project Structure

```
.
├── public/
│   ├── css/                # All stylesheets
│   ├── js/                 # Frontend logic (whiteboard.js, login.js, voice.js)
│   └── index.html          # Main UI HTML page
├── routes/
│   ├── drawing.js          # Save/delete/load drawings APIs
│   └── auth.js             # Token auth route
├── models/
│   └── Drawing.js          # Mongoose schema
├── app.js                  # Express server setup
├── .env                    # Environment config
└── README.md               # This file
```

---

## 🚀 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/kunal-kumar11/nodejs_Resquest_Response.git
cd nodejs_Resquest_Response
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AGORA_APP_ID=your_agora_app_id
```

### 4. Run the Server

```bash
node app.js
```

Open your browser: `http://localhost:5000`

---

## 🎨 Admin & User Flow

### Admin Flow

1. Enters email and name
2. Clicks "Generate Room ID"
3. Clicks "Create Room"
4. Receives JWT token (marked as admin)
5. Can draw, save, delete, and see past drawings

### Participant Flow

1. Enters email and name
2. Enters Room ID
3. Clicks "Join Room"
4. Receives JWT token (marked as participant)
5. Can draw but **cannot save/delete**

### Data Flow

* Room ID and user data are stored in `localStorage`
* Socket.IO joins room automatically
* Drawings are stored with:

  ```json
  {
    "roomId": "string",
    "uploader": "email@example.com",
    "name": "Full Name",
    "image": "base64 string",
    "createdAt": "timestamp"
  }
  ```

---

## 🌐 Technologies Used

| Tech      | Purpose                 |
| --------- | ----------------------- |
| Node.js   | Backend runtime         |
| Express   | Server framework        |
| Socket.IO | Real-time communication |
| MongoDB   | Image storage           |
| Mongoose  | Schema modeling         |
| Fabric.js | Canvas drawing          |
| Agora SDK | Voice chat integration  |
| JWT       | Authentication          |

---

## 🌟 Future Enhancements

* ✉️ Invite via Email or Link
* 📲 Mobile Responsive UI
* ✔️ Real-time Chat Support
* 🔧 Export Whiteboard History

---

## 👤 Author

Made with passion by [**Kunal Kumar**](https://github.com/kunal-kumar11)
If you like this project, please consider giving it a star ⭐

---

## 📄 License

MIT License - Free to use and modify
