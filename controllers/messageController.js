import Message from '../models/message.js';
import Chat from '../models/chat.js';

export const createMessage = async (req, res) => {
  try {
    const { senderId, chatId, text } = req.body;

    if (!senderId || !chatId || !text) {
      return res.status(400).json({ message: 'Sender ID, chat ID, and text are required.' });
    }

    const newMessage = new Message({
      senderId,
      chatId,
      text
    });

    const savedMessage = await newMessage.save();

    await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: savedMessage._id } },
      { new: true } 
    );

    res.status(201).json({ message: savedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating message.' });
  }
};

export const getMessagesOfChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required.' });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};