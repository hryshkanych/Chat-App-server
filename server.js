import { createServer } from 'http';
import app from './app.js'; 
import { initializeSocket } from './socket/socket.js'; 

const PORT = process.env.PORT || 3000;

const server = createServer(app); 

initializeSocket(server); 

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
