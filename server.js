import app from './app.js'; // Імпорт основного додатка з app.js

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
