import express from 'express';
import { signupUser, signinUser } from '../controllers/userController.js'; 
import { createChat } from '../controllers/chatController.js';
import { createMessage } from '../controllers/messageController.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/signin', signinUser);

export default router;
