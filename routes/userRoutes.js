import express from 'express';
import { signupUser, signinUser, getUserByName } from '../controllers/userController.js'; 

const router = express.Router();

router.post('/signup', signupUser);
router.post('/signin', signinUser);
router.post('/getUserByName', getUserByName)

export default router;
