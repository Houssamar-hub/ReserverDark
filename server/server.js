import app from "./app.js";
import http from "http";
import { initializeSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 Socket.io initialized`);
});
