import Chat from "../models/chat.js";
import User from "../models/user.js";
import Message from "../models/message.js";

export const createChat = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ message: 'You must specify exactly two participants for the chat.' });
    }

    const newChat = new Chat({
      participants,
      messages: []
    });

    await newChat.save();

    res.status(201).json({ chat: newChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating chat.' });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ participants: userId }).populate('participants');

    const chatDetails = [];


    for (let chat of chats) {
      const otherParticipant = chat.participants.find(participant => participant._id.toString() !== userId);
      const otherUser = await User.findById(otherParticipant._id).select('firstName lastName');
      const lastMessage = await Message.findOne({ chatId: chat._id })
                                       .sort({ createdAt: -1 })
                                       .select('text createdAt');
      // console.log('other user  ',otherParticipant._id );
      

      chatDetails.push({
        chatId: chat._id,
        user: {
          otherUserId: otherParticipant._id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName
        },
        lastMessage: lastMessage ? {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt
        } : null
      });
    }

    chatDetails.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.status(200).json({ chats: chatDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user chats.' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found.' });
    }

    await Message.deleteMany({ chatId: chat._id });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: 'Chat deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting chat.' });
  }
};
