import { createServer } from 'http';
import app from './app.js'; // Import the app
import { initializeSocket } from './socket/socket.js'; // Import the Socket.IO initialization

const PORT = process.env.PORT || 3000;

const server = createServer(app); // Create an HTTP server

initializeSocket(server); // Initialize Socket.IO

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
