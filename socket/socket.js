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

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinChat', ({ chatId }) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('sendMessage', async ({ senderId, chatId, text, createdAt }) => {
      console.log(createdAt);

      try {
        // Створення нового повідомлення в базі даних
        const newMessage = new Message({
          senderId,
          chatId,
          text,
        });

        const savedMessage = await newMessage.save();

        // Додаємо повідомлення до чату
        await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: savedMessage._id } },
          { new: true } 
        );

        // Відправка повідомлення всім учасникам чату
        io.to(chatId).emit('receiveMessage', savedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
