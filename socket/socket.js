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
    console.log("User connected", socket.id)
    const userId = socket.handshake.query.userId;
    
      connectedUsers[userId] = socket.id;
      io.emit('updateUserList', connectedUsers); // Optionally, notify all clients about the connected users
      console.log("Our list in bc users", connectedUsers);
      

      socket.on('disconnect', () => {

        console.log("DISCONNECT");
        
        // Find and remove user from connectedUsers
        const disconnectedUserId = Object.keys(connectedUsers).find(
          userId => connectedUsers[userId] === socket.id
        );
  
        if (disconnectedUserId) {
          delete connectedUsers[disconnectedUserId];
          io.emit('updateUserList', connectedUsers); // Optionally, notify all clients about the updated user list
          console.log(`User disconnected: ${disconnectedUserId}`);
          console.log("After dis", connectedUsers);
          
        }
  
        console.log('Client disconnected');
      });

    // Handle sending messages
    socket.on('sendMessage', async ({ senderId, chatId, text, createdAt }) => {

      try {
        // Create new message in database
        const newMessage = new Message({
          senderId,
          chatId,
          text,
        });


        const chat = await Chat.findById(chatId)
        .populate('participants') // Populate only the participants field
        .exec();


        const otherParticipant = chat.participants.find(participant => 
          participant._id.toString() !== senderId.toString()
        );
        const receiver = otherParticipant._id.toString()
      
        
        const receiverSocketId = connectedUsers[receiver];
        console.log("Example for Chris2", receiverSocketId);

        await newMessage.save();

        // Add message to chat
        await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: newMessage._id } },
          { new: true } 
        );

        io.to(receiverSocketId).emit('receiveMessage', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle user disconnection
  
  });
};
