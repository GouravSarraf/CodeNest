import { create } from 'zustand';
import socket from '../services/socket';

export const useSocketStore = create((set, get) => ({
  socket,
  isConnected: false,
  currentProjectId: null,

  connectSocket: () => {
    if (!get().socket.connected) {
      get().socket.connect();
      
      // Set up connection event handlers
      socket.on('connect', () => {
        set({ isConnected: true });
        console.log('Socket connected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        set({ isConnected: false });
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
        console.log('Socket disconnected');
      });
    }
  },

  disconnectSocket: () => {
    if (get().socket.connected) {
      get().socket.disconnect();
      set({ isConnected: false, currentProjectId: null });
    }
  },

  joinProject: (projectId) => {
    if (get().socket.connected) {
      get().socket.emit('join-project', projectId);
      set({ currentProjectId: projectId });
    }
  },

  leaveProject: (projectId) => {
    if (get().socket.connected) {
      get().socket.emit('leave-project', projectId);
      set({ currentProjectId: null });
    }
  },

  emitFileUpdate: (projectId, fileId, code) => {
    if (get().socket.connected && get().currentProjectId === projectId) {
      socket.emit('file-update', { projectId, fileId, code });
    }
  },

  onFileUpdate: (callback) => {
    socket.on('file-update', callback);
  },

  clearListeners: () => {
    socket.removeAllListeners('file-update');
    socket.removeAllListeners('connect');
    socket.removeAllListeners('connect_error');
    socket.removeAllListeners('disconnect');
  },
}));