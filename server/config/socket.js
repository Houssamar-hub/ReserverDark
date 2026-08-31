import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? 'https://yourdomain.com' 
          : 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });

      // Ping-Pong for keep-alive
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    return io;
  } catch (error) {
    console.error('Socket.io initialization error:', error);
    return null;
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initializeSocket, getIO };