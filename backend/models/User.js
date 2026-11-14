const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      default: 'Demo User'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'user@example.com'
    },
    dailyCalorieGoal: {
      type: Number,
      default: 2000,
      min: [500, 'Daily calorie goal must be at least 500 kcal'],
      max: [10000, 'Daily calorie goal cannot exceed 10000 kcal']
    },
    dailyCarbsGoal: {
      type: Number,
      default: 250,
      min: 0
    },
    dailyProteinGoal: {
      type: Number,
      default: 100,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
