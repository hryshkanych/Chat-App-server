import { Server } from 'socket.io';
import Message from '../models/message.js';
import Chat from '../models/chat.js';
import User from '../models/user.js'; 
import { getAutoresponse } from '../utils/autoresponse.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      methods: ["GET", "POST"],
    },
  });

  const connectedUsers = {};

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    connectedUsers[userId] = socket.id;
    io.emit('updateUserList', connectedUsers);

    socket.on('disconnect', () => {
      const disconnectedUserId = Object.keys(connectedUsers).find(
        userId => connectedUsers[userId] === socket.id
      );

      if (disconnectedUserId) {
        delete connectedUsers[disconnectedUserId];
        io.emit('updateUserList', connectedUsers);
      }
    });


    socket.on('sendMessage', async ({ senderId, chatId, text }) => {
      try {
        const newMessage = new Message({
          senderId,
          chatId,
          text,
        });

        await newMessage.save();

        await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: newMessage._id } },
          { new: true }
        );

        const chat = await Chat.findById(chatId).populate('participants').exec();

        const sender = await User.findById(senderId); 
        const receiver = chat.participants.find(participant => 
          participant._id.toString() !== senderId.toString()
        );

        const receiverSocketId = connectedUsers[receiver._id.toString()];
        io.to(receiverSocketId).emit('receiveMessage', {
          ...newMessage.toObject(),
          senderName: `${sender.firstName} ${sender.lastName}`,
        });

        const senderSocketId = connectedUsers[senderId.toString()];

        setTimeout(async () => {
          const autoresponseText = await getAutoresponse();

          const autoresponseMessage = new Message({
            senderId: receiver._id,
            chatId,
            text: autoresponseText,
          });

          await autoresponseMessage.save();

          const autoResponder = await User.findById(receiver._id); 

          io.to(receiverSocketId).emit('receiveMessage', {
            ...autoresponseMessage.toObject(),
            senderName: `${autoResponder.firstName} ${autoResponder.lastName}`,
          });

          io.to(senderSocketId).emit('receiveMessage', {
            ...autoresponseMessage.toObject(),
            senderName: `${autoResponder.firstName} ${autoResponder.lastName}`,
          });
        }, 3000);

      } catch (error) {
        console.error('Error saving message:', error);
      }
    });
  });
};
