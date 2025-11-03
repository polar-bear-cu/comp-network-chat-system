# SockeTalk

A real-time chat application built with React, Node.js, Express, MongoDB, and Socket.IO featuring both direct messaging and group chat capabilities.

## 🌐 Live Demo

**Production URL**: [https://polar-bear-chat-system-gpapr.sevalla.app/](https://polar-bear-chat-system-gpapr.sevalla.app/)

> *Deployed on Sevalla*

## ✨ Features

- **Real-time Communication**: Instant messaging using Socket.IO
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Direct Messaging**: Private one-on-one conversations
- **Group Chat**: Create and join group conversations
- **Online Status**: Real-time online/offline user indicators
- **Message History**: Persistent message storage in MongoDB
- **Modern UI**: Responsive design with Tailwind CSS and shadcn/ui components
- **Dark Mode Support**: Built-in light and dark theme support

## 🛠️ Tech Stack

### Frontend
- React 19 (JavaScript)
- Vite
- Tailwind CSS 4
- shadcn/ui components
- Zustand (state management)
- Socket.IO Client
- React Router
- Axios

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JWT authentication
- bcryptjs

## 🚀 Installation

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

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

## 💻 Running the Application

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:3000`

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
The app will run on `http://localhost:5173`

### Production Build

From the root directory:
```bash
npm run build
npm start
```

This will:
- Install dependencies for both frontend and backend
- Build the frontend for production
- Serve the application from the backend server

## 📁 Project Structure

```
comp-network-chat-system/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── lib/              # Utilities (DB, Socket, JWT)
│   │   ├── middleware/       # Auth middleware
│   │   ├── model/            # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   └── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── page/             # Page components
│   │   ├── store/            # Zustand stores
│   │   └── main.jsx          # Entry point
│   └── package.json
└── package.json              # Root package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Messages
- `GET /api/messages/contacts` - Get all contacts
- `GET /api/messages/chats` - Get chat partners
- `GET /api/messages/:id` - Get messages with specific user
- `POST /api/messages/send/:id` - Send message to user

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `GET /api/groups/:id/messages` - Get group messages
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/send` - Send message to group

## 🔄 Socket.IO Events

### Client → Server
- `connection` - User connects
- `disconnect` - User disconnects

### Server → Client
- `getOnlineUsers` - Broadcast online users list
- `newMessage` - New direct message
- `newGroupMessage` - New group message
- `newGroup` - New group created
- `groupUpdated` - Group information updated

## ⚙️ Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/sockettalk |
| NODE_ENV | Environment | development/production |
| JWT_SECRET | Secret key for JWT | your_secret_key |
| CLIENT_URL | Frontend URL | http://localhost:5173 |

## 🚢 Deployment

### Deployed on Sevalla

This application is currently hosted on [Sevalla](https://sevalla.com/), a modern cloud hosting platform.

**Production URL**: [https://polar-bear-chat-system-gpapr.sevalla.app/](https://polar-bear-chat-system-gpapr.sevalla.app/)

### Deployment Setup

1. **Database Setup - MongoDB Atlas**
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Whitelist all IP addresses (0.0.0.0/0) for Sevalla

2. **Deploy to Sevalla**
   - Sign up at [Sevalla](https://sevalla.com/)
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Start command: `npm start`
   - Set environment variables (see below)
   - Deploy your application

3. **Production Environment Variables**
```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=https://polar-bear-chat-system-gpapr.sevalla.app
```

## 🎯 Features Overview

### User Authentication
- Secure password hashing with bcryptjs
- JWT token-based authentication
- HTTP-only cookies for token storage
- Protected routes

### Real-time Features
- Socket.IO for instant messaging
- Online/offline status indicators
- Real-time group updates

### Chat Features
- Direct messaging between users
- Group chat functionality
- Message history
- Timestamps on messages
- User presence indicators
