const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedDatabase } = require('./data/seedData');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Seed sample foods & default user if needed
  seedDatabase();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Nutrition & Diet Tracker API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/logs', require('./routes/foodLogRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
