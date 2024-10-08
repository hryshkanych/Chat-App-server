import express from 'express';
import { createChat, deleteChat, getUserChats } from '../controllers/chatController.js';
import { createMessage, getMessagesOfChat } from '../controllers/messageController.js';

const router = express.Router();

router.post('/chats', createChat);
router.delete('/deleteChat/:chatId', deleteChat);
router.post('/messages', createMessage);
router.get('/chats/:userId', getUserChats);
router.get('/messages/:chatId', getMessagesOfChat);

export default router;
