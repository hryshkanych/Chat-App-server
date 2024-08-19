import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js'; 
import Chat from '../models/chat.js';

export const signupUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const randomUsers = await User.aggregate([{ $sample: { size: 3 } }]);

    const chatPromises = randomUsers.map(randomUser => {
      return new Chat({
        participants: [newUser._id, randomUser._id],
        messages: [] 
      }).save();
    });

    await Promise.all(chatPromises);

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token);
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('here data' + email, password);
    

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const getUserByName = async (req, res) => {
  try {
      const { firstName, lastName } = req.body; 

      const user = await User.findOne({ firstName, lastName });

      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving user.' });
  }
};