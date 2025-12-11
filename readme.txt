# Mushroom Kingdom Chat

Mushroom Kingdom Chat is a small real-time chat app styled like a gamer / Discord room.  
It uses a Node.js + TypeScript backend with Socket.IO and a lightweight HTML/CSS/JS frontend.

You can run it locally to chat with friends, or expose it to the internet with a tunnel
tool such as **ngrok**.

---

## Tech stack

**Backend**

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/) – HTTP server and REST endpoints
- [Socket.IO](https://socket.io/) – real-time WebSocket communication
- [cors](https://github.com/expressjs/cors) – CORS middleware
- TypeScript – strongly-typed server code compiled to JavaScript (output in `dist/`)

**Frontend**

- Static HTML (`public/index.html`)
- Vanilla JavaScript (`public/client.js`)
- Custom CSS in a Discord-like / gamer style (`public/styles.css`)
- Socket.IO client (served from `/socket.io/socket.io.js` by the server)

**Data model**

- Simple in-memory message store in `src/models/chatMessage.ts`
  - Messages are kept in RAM only (no database)
  - History length is limited (older messages are dropped)

---

## Features

- Real-time chat between all connected clients
- In-memory message history returned via a REST endpoint (`GET /api/messages`)
- Online users counter (players online)
- Connection status indicator (online / offline pill)
- Nickname is stored in `localStorage` and restored on reload
- Character counter for the message input with a soft limit
- Keyboard shortcut: `Ctrl + Enter` / `Cmd + Enter` to send a message
- Gamer / Discord-style UI with message cards, avatars and dark theme

---

## Project structure

```text
.
├── public/
│   ├── index.html         # Main page
│   ├── client.js          # Frontend Socket.IO + UI logic
│   └── styles.css         # Chat styling
├── src/
│   ├── server.ts          # Express + Socket.IO server entry point
│   ├── routes/
│   │   └── chatRoutes.ts  # REST routes (messages history)
│   ├── controllers/
│   │   └── chatController.ts # HTTP controller for chat
│   ├── models/
│   │   └── chatMessage.ts # In-memory message model
│   └── services/
│       └── socketService.ts # Socket.IO events & online counter
├── dist/                  # Compiled JavaScript output (server)
├── package.json
└── tsconfig.json
