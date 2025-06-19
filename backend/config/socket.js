const { Server } = require('socket.io');
const { instrument } = require("@socket.io/admin-ui");

function initSocket(server) {
  const io = new Server(server, {
    cors: { 
      origin: true,
      credentials: true
    }
  });

  // Admin UI instrumentation
  instrument(io, {
    auth: false
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`Socket ${socket.id} joined project-${projectId}`);
    });

    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`Socket ${socket.id} left project-${projectId}`);
    });

    socket.on('file-update', (data) => {
      io.to(`project-${data.projectId}`).emit('file-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };
