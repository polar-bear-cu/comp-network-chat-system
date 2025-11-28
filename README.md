# SockeTalk

A modern, real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO.

## 🌐 Live Demo

**Production URL**: [https://polar-bear-chat-system-gpapr.sevalla.app/](https://polar-bear-chat-system-gpapr.sevalla.app/) (Temporary Closed)

> *Hosted on Sevalla Cloud Platform*

## ✨ Key Features

### 💬 Real-time Communication
- **Instant Messaging**: Powered by Socket.IO for seamless real-time updates
- **Typing Indicators**: See when others are typing in both DMs and group chats
- **Online Status**: Real-time presence indicators showing who's online
- **Message Timestamps**: Every message shows exact time sent

### 👥 User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **HTTP-only Cookies**: Enhanced security for token storage
- **User Profiles**: Simple, elegant profile display

### 💭 Messaging Features
- **Direct Messaging**: Private one-on-one conversations
- **Group Chat**: Create and join unlimited group conversations
- **Join/Leave Groups**: Flexible group membership with system notifications
- **Group Ownership**: Group creators have special privileges
- **Message History**: All messages are stored persistently in MongoDB
- **Chat Management**: Organized tabs for Chats, Contacts, and Groups

## 🛠️ Tech Stack

### Frontend
- **React* 
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Zustand** for state management
- **Socket.IO Client** for communication
- **React Router**
- **Axios**
- **Lucide React**

### Backend
- **Node.js**
- **Express**
- **MongoDB**
- **Socket.IO**
- **JWT**
- **bcryptjs**
- **Cookie Parser**
- **CORS**

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/polar-bear-cu/comp-network-chat-system.git
   cd comp-network-chat-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create `.env` file:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/sockettalk
   NODE_ENV=development
   JWT_SECRET=your_secure_secret_key_here
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

Run both backend and frontend concurrently:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs at `http://localhost:5173`

### Production Build

From the root directory:
```bash
npm run build
npm start
```

## 📁 Project Structure

```
comp-network-chat-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── message.controller.js
│   │   │   ├── group.controller.js
│   │   │   └── group.message.controller.js
│   │   ├── lib/              # Utilities
│   │   │   ├── db.js         # MongoDB connection
│   │   │   ├── socket.js     # Socket.IO setup
│   │   │   └── utils.js      # Helper functions
│   │   ├── middleware/       # Auth middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── socket.auth.middleware.js
│   │   ├── model/            # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── message.model.js
│   │   │   ├── group.model.js
│   │   │   └── group.message.model.js
│   │   ├── routes/           # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   └── group.route.js
│   │   └── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── page/             # Page components
│   │   ├── store/            # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useGroupStore.js
│   │   └── main.jsx          # Entry point
│   └── package.json
└── package.json              # Root scripts
```

## 🔌 API Documentation

### Authentication Routes
```
POST   /api/auth/signup    Register new user
POST   /api/auth/login     Login user
POST   /api/auth/logout    Logout user
GET    /api/auth/check     Verify authentication
```

### Message Routes
```
GET    /api/messages/contacts    Get all users
GET    /api/messages/chats       Get users with chat history
GET    /api/messages/:id         Get messages with specific user
POST   /api/messages/send/:id    Send message to user
```

### Group Routes
```
GET    /api/groups               Get all groups
GET    /api/groups/:id           Get group details
GET    /api/groups/:id/messages  Get group messages
POST   /api/groups               Create new group
POST   /api/groups/:id/join      Join group
POST   /api/groups/:id/leave     Leave group
POST   /api/groups/:id/send      Send message to group
```

## 🔄 Socket.IO Events

### Client → Server
- `connection` - User connects
- `disconnect` - User disconnects
- `typing` - User is typing (DM)
- `stopTyping` - User stopped typing (DM)
- `joinGroup` - User joins group room
- `leaveGroup` - User leaves group room
- `groupTyping` - User is typing in group
- `groupStopTyping` - User stopped typing in group

### Server → Client
- `getOnlineUsers` - Broadcast online users list
- `newMessage` - New direct message received
- `newGroupMessage` - New group message received
- `newGroup` - New group created
- `groupUpdated` - Group information updated
- `newUser` - New user registered
- `userTyping` - Someone is typing to you
- `userStopTyping` - Someone stopped typing
- `groupUserTyping` - Someone is typing in group
- `groupUserStopTyping` - Someone stopped typing in group

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=3000                              # Server port
MONGO_URI=mongodb://...                # MongoDB connection string
NODE_ENV=development                   # Environment (development/production)
JWT_SECRET=your_secret_key            # JWT signing secret
CLIENT_URL=http://localhost:5173      # Frontend URL for CORS
```

## 🚢 Deployment

### Deploy to Sevalla (Current Setup)

1. **Setup MongoDB Atlas**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Whitelist all IPs (0.0.0.0/0)

2. **Deploy to Sevalla**
   - Sign up at [Sevalla](https://sevalla.com/)
   - Connect GitHub repository
   - Configure:
     - Build: `npm run build`
     - Start: `npm start`
   - Set environment variables
   - Deploy

3. **Production Environment**
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://...
   NODE_ENV=production
   JWT_SECRET=secure_random_string
   CLIENT_URL=https://your-app.sevalla.app
   ```
---
