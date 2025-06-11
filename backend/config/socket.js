const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: { 
      origin: true,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`Socket ${socket.id} joined project-${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`Socket ${socket.id} left project-${projectId}`);
    });

    // Handle file updates
    socket.on('file-update', (data) => {
      // Only broadcast to users in the same project
      io.to(`project-${data.projectId}`).emit('file-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };