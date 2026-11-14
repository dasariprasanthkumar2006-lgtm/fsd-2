const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true
    },
    barcode: {
      type: String,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    calories: {
      type: Number,
      required: [true, 'Calories value is required'],
      min: 0
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Carbohydrates value is required'],
      min: 0
    },
    protein: {
      type: Number,
      required: [true, 'Protein value is required'],
      min: 0
    },
    quantity: {
      type: String,
      default: '1 serving'
    },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Packaged', 'General'],
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
