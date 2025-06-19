import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false
});

export default socket;
