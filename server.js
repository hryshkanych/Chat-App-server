import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js'; // Adjust path if necessary

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set Mongoose options
mongoose.set('strictQuery', true);

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
