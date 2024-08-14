import jwt from 'jsonwebtoken';
import config from '../config.js';

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;  // Зчитування токена з cookies

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};
