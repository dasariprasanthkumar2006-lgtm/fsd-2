const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true
    },
    calories: {
      type: Number,
      required: [true, 'Calories value is required'],
      min: [0, 'Calories cannot be negative']
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrates value is required'],
      min: [0, 'Carbohydrates cannot be negative']
    },
    protein: {
      type: Number,
      required: [true, 'Protein value is required'],
      min: [0, 'Protein cannot be negative']
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'],
      default: 'Snack'
    },
    barcode: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now
    },
    dateString: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness of timestamp per user at the database level
foodLogSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

// Index for date querying
foodLogSchema.index({ userId: 1, dateString: 1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);
