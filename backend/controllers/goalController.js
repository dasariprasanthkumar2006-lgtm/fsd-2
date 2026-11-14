const User = require('../models/User');
const DailyGoal = require('../models/DailyGoal');
const { getOrCreateDefaultUser } = require('../utils/getOrCreateUser');

// @desc    Get user's daily goals
// @route   GET /api/goals
// @access  Public
const getGoal = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        dailyCarbsGoal: user.dailyCarbsGoal || 250,
        dailyProteinGoal: user.dailyProteinGoal || 100
      }
    });
  } catch (error) {
    console.error('Error getting goal:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving goal.' });
  }
};

// @desc    Update user's daily calorie goal
// @route   POST /api/goals or PUT /api/goals
// @access  Public
const updateGoal = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    const { dailyCalorieGoal, dailyCarbsGoal, dailyProteinGoal } = req.body;

    if (dailyCalorieGoal === undefined || isNaN(Number(dailyCalorieGoal))) {
      return res.status(400).json({
        success: false,
        message: 'A valid daily calorie goal number is required.'
      });
    }

    const calorieTarget = Number(dailyCalorieGoal);
    if (calorieTarget < 500 || calorieTarget > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Daily calorie goal must be between 500 and 10,000 kcal.'
      });
    }

    user.dailyCalorieGoal = calorieTarget;
    if (dailyCarbsGoal !== undefined && !isNaN(Number(dailyCarbsGoal))) {
      user.dailyCarbsGoal = Math.max(0, Number(dailyCarbsGoal));
    }
    if (dailyProteinGoal !== undefined && !isNaN(Number(dailyProteinGoal))) {
      user.dailyProteinGoal = Math.max(0, Number(dailyProteinGoal));
    }

    await user.save();

    // Record in DailyGoal history
    const today = new Date().toISOString().split('T')[0];
    await DailyGoal.findOneAndUpdate(
      { userId: user._id, date: today },
      {
        targetCalories: user.dailyCalorieGoal,
        targetCarbs: user.dailyCarbsGoal,
        targetProtein: user.dailyProteinGoal
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Daily calorie goal updated to ${user.dailyCalorieGoal} kcal.`,
      data: {
        dailyCalorieGoal: user.dailyCalorieGoal,
        dailyCarbsGoal: user.dailyCarbsGoal,
        dailyProteinGoal: user.dailyProteinGoal
      }
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return res.status(500).json({ success: false, message: 'Server error updating goal.' });
  }
};

module.exports = {
  getGoal,
  updateGoal
};
