import { Server } from 'socket.io';
import Message from '../models/message.js';
import Chat from '../models/chat.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
    },
  });

  // Store connected users
  const connectedUsers = {};

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Track user connection
    socket.on('userConnected', (userId) => {
      connectedUsers[userId] = socket.id;
      io.emit('updateUserList', connectedUsers); // Optionally, notify all clients about the connected users
      console.log(`User connected: ${userId}`);
    });

    // Handle joining a chat
    socket.on('joinChat', ({ chatId }) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ senderId, chatId, text, createdAt }) => {
      console.log(createdAt);

      try {
        // Create new message in database
        const newMessage = new Message({
          senderId,
          chatId,
          text,
        });

        const savedMessage = await newMessage.save();

        // Add message to chat
        await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: savedMessage._id } },
          { new: true } 
        );

        // Send message to all participants in chat
        io.to(chatId).emit('receiveMessage', savedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      // Find and remove user from connectedUsers
      const disconnectedUserId = Object.keys(connectedUsers).find(
        userId => connectedUsers[userId] === socket.id
      );

      if (disconnectedUserId) {
        delete connectedUsers[disconnectedUserId];
        io.emit('updateUserList', connectedUsers); // Optionally, notify all clients about the updated user list
        console.log(`User disconnected: ${disconnectedUserId}`);
      }

      console.log('Client disconnected');
    });
  });
};
