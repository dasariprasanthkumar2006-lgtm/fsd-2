const mongoose = require('mongoose');

const dailyGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetCalories: {
      type: Number,
      required: [true, 'Target calories is required'],
      min: [500, 'Target calories must be at least 500 kcal'],
      max: [10000, 'Target calories cannot exceed 10,000 kcal']
    },
    targetCarbs: {
      type: Number,
      default: 250,
      min: 0
    },
    targetProtein: {
      type: Number,
      default: 100,
      min: 0
    },
    date: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DailyGoal', dailyGoalSchema);
