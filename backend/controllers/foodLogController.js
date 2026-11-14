const FoodLog = require('../models/FoodLog');
const User = require('../models/User');
const { getOrCreateDefaultUser } = require('../utils/getOrCreateUser');

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to format date string YYYY-MM-DD
const formatDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Add a new food log entry
// @route   POST /api/logs
// @access  Public
const addFoodLog = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    const userId = req.body.userId || user._id;

    let { foodName, quantity, calories, carbohydrates, protein, mealType, timestamp, date } = req.body;

    // Validate required fields
    if (!foodName || foodName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Food name is required.' });
    }
    if (!quantity || quantity.trim() === '') {
      return res.status(400).json({ success: false, message: 'Quantity is required.' });
    }
    if (calories === undefined || calories === null || isNaN(Number(calories)) || Number(calories) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative calories amount is required.' });
    }
    if (carbohydrates === undefined || carbohydrates === null || isNaN(Number(carbohydrates)) || Number(carbohydrates) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative carbohydrates amount is required.' });
    }
    if (protein === undefined || protein === null || isNaN(Number(protein)) || Number(protein) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative protein amount is required.' });
    }

    foodName = foodName.trim();
    quantity = quantity.trim();
    calories = Math.round(Number(calories) * 10) / 10;
    carbohydrates = Math.round(Number(carbohydrates) * 10) / 10;
    protein = Math.round(Number(protein) * 10) / 10;

    // Handle timestamp and date
    let entryDateObj;
    if (timestamp) {
      entryDateObj = new Date(timestamp);
      if (isNaN(entryDateObj.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid timestamp provided.' });
      }
    } else {
      entryDateObj = new Date();
    }

    // Check 1-Year History limit rule (entries cannot be older than 365 days)
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    if (entryDateObj < oneYearAgo) {
      return res.status(400).json({
        success: false,
        message: 'Food logs cannot be created for dates older than 1 year (365 days).'
      });
    }

    const dateString = date || formatDateString(entryDateObj);

    // Rule 9: Duplicate Prevention - Prevent multiple food entries with the same exact timestamp
    const duplicateTimestamp = await FoodLog.findOne({
      userId,
      timestamp: entryDateObj
    });

    if (duplicateTimestamp) {
      return res.status(400).json({
        success: false,
        message: `Duplicate entry error: An entry with timestamp ${entryDateObj.toISOString()} already exists. Exact duplicate timestamps are prevented.`
      });
    }

    // Rule 8: Food Limit - Do not allow the same food to be logged more than 3 times per day
    const existingSameFoodCount = await FoodLog.countDocuments({
      userId,
      dateString,
      foodName: { $regex: new RegExp(`^${escapeRegex(foodName)}$`, 'i') }
    });

    if (existingSameFoodCount >= 3) {
      return res.status(400).json({
        success: false,
        message: `Food limit reached: "${foodName}" has already been logged ${existingSameFoodCount} times on ${dateString}. You cannot log the same food more than 3 times per day.`
      });
    }

    // Create the food log entry
    const newLog = await FoodLog.create({
      userId,
      foodName,
      quantity,
      calories,
      carbohydrates,
      protein,
      mealType: mealType || 'Snack',
      barcode: req.body.barcode || '',
      timestamp: entryDateObj,
      dateString
    });

    // Check if daily calorie target has been exceeded with this new entry
    const dayLogs = await FoodLog.find({ userId, dateString });
    const totalCaloriesToday = dayLogs.reduce((sum, item) => sum + item.calories, 0);
    const calorieGoal = user.dailyCalorieGoal || 2000;
    const isExceeded = totalCaloriesToday > calorieGoal;

    return res.status(201).json({
      success: true,
      data: newLog,
      dailySummary: {
        totalCalories: Math.round(totalCaloriesToday),
        dailyGoal: calorieGoal,
        remainingCalories: Math.max(0, Math.round(calorieGoal - totalCaloriesToday)),
        isExceeded,
        exceededBy: isExceeded ? Math.round(totalCaloriesToday - calorieGoal) : 0
      },
      message: isExceeded
        ? `Food logged successfully! Warning: You have exceeded your daily calorie goal of ${calorieGoal} kcal by ${Math.round(totalCaloriesToday - calorieGoal)} kcal.`
        : 'Food logged successfully!'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected with this exact timestamp for this user.'
      });
    }
    console.error('Error adding food log:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error adding food log.' });
  }
};

// @desc    Get food logs and nutrition breakdown for a specific day
// @route   GET /api/logs/daily
// @access  Public
const getDailyLogs = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    const userId = req.query.userId || user._id;
    const dateString = req.query.date || formatDateString(new Date());

    // Validate that requested date is within 1 year history
    const requestedDateObj = new Date(`${dateString}T00:00:00`);
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

    if (requestedDateObj < oneYearAgo) {
      return res.status(400).json({
        success: false,
        message: 'History view is limited to the past 365 days (1 year).'
      });
    }

    const logs = await FoodLog.find({ userId, dateString }).sort({ timestamp: -1 });

    const totalCalories = logs.reduce((sum, item) => sum + item.calories, 0);
    const totalCarbs = logs.reduce((sum, item) => sum + item.carbohydrates, 0);
    const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);

    const calorieGoal = user.dailyCalorieGoal || 2000;
    const carbsGoal = user.dailyCarbsGoal || 250;
    const proteinGoal = user.dailyProteinGoal || 100;

    const remainingCalories = calorieGoal - totalCalories;
    const isExceeded = totalCalories > calorieGoal;
    const exceededBy = isExceeded ? Math.round(totalCalories - calorieGoal) : 0;

    return res.status(200).json({
      success: true,
      date: dateString,
      summary: {
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalProtein: Math.round(totalProtein * 10) / 10,
        calorieGoal,
        carbsGoal,
        proteinGoal,
        remainingCalories: Math.round(remainingCalories * 10) / 10,
        isExceeded,
        exceededBy
      },
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching daily logs.' });
  }
};

// @desc    Get food log history for up to one year
// @route   GET /api/logs/history
// @access  Public
const getHistoryLogs = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    const userId = req.query.userId || user._id;

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(now.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

    let startDate = req.query.startDate;
    let endDate = req.query.endDate || formatDateString(now);

    if (!startDate) {
      // Default to last 30 days
      const d = new Date();
      d.setDate(d.getDate() - 30);
      startDate = formatDateString(d);
    }

    const startDateObj = new Date(`${startDate}T00:00:00`);
    if (startDateObj < oneYearAgo) {
      startDate = formatDateString(oneYearAgo);
    }

    // Query all logs in this range
    const logs = await FoodLog.find({
      userId,
      dateString: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    // Group logs by date
    const historyMap = {};
    logs.forEach((log) => {
      const d = log.dateString;
      if (!historyMap[d]) {
        historyMap[d] = {
          date: d,
          totalCalories: 0,
          totalCarbs: 0,
          totalProtein: 0,
          itemCount: 0,
          items: []
        };
      }
      historyMap[d].totalCalories += log.calories;
      historyMap[d].totalCarbs += log.carbohydrates;
      historyMap[d].totalProtein += log.protein;
      historyMap[d].itemCount += 1;
      historyMap[d].items.push(log);
    });

    const dailyGoal = user.dailyCalorieGoal || 2000;
    const history = Object.values(historyMap)
      .map((day) => ({
        ...day,
        totalCalories: Math.round(day.totalCalories),
        totalCarbs: Math.round(day.totalCarbs * 10) / 10,
        totalProtein: Math.round(day.totalProtein * 10) / 10,
        calorieGoal: dailyGoal,
        isExceeded: day.totalCalories > dailyGoal,
        exceededBy: day.totalCalories > dailyGoal ? Math.round(day.totalCalories - dailyGoal) : 0
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return res.status(200).json({
      success: true,
      startDate,
      endDate,
      totalDaysWithLogs: history.length,
      history
    });
  } catch (error) {
    console.error('Error fetching history logs:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching history.' });
  }
};

// @desc    Get 7-day analytics and macronutrient breakdown for charts
// @route   GET /api/logs/analytics
// @access  Public
const getAnalytics = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    const userId = req.query.userId || user._id;

    // Generate last 7 dates
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(formatDateString(d));
    }

    const logs = await FoodLog.find({
      userId,
      dateString: { $in: dates }
    });

    const calorieGoal = user.dailyCalorieGoal || 2000;

    // Aggregate by date
    const dailyData = dates.map((dateStr) => {
      const dayLogs = logs.filter((l) => l.dateString === dateStr);
      const calories = dayLogs.reduce((acc, curr) => acc + curr.calories, 0);
      const carbs = dayLogs.reduce((acc, curr) => acc + curr.carbohydrates, 0);
      const protein = dayLogs.reduce((acc, curr) => acc + curr.protein, 0);

      // Format display label e.g., "Mon", "Tue"
      const dateObj = new Date(`${dateStr}T12:00:00`);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      return {
        date: dateStr,
        dayLabel: dayName,
        calories: Math.round(calories),
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        goal: calorieGoal,
        isExceeded: calories > calorieGoal
      };
    });

    // Today's macro distribution
    const todayStr = formatDateString(new Date());
    const todayLogs = logs.filter((l) => l.dateString === todayStr);
    const todayCarbs = todayLogs.reduce((acc, curr) => acc + curr.carbohydrates, 0);
    const todayProtein = todayLogs.reduce((acc, curr) => acc + curr.protein, 0);

    return res.status(200).json({
      success: true,
      calorieGoal,
      weeklyStats: dailyData,
      todayMacros: {
        carbohydrates: Math.round(todayCarbs * 10) / 10,
        protein: Math.round(todayProtein * 10) / 10,
        // Calories from carbs: 4 kcal/g, protein: 4 kcal/g
        carbsCalories: Math.round(todayCarbs * 4),
        proteinCalories: Math.round(todayProtein * 4)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching analytics.' });
  }
};

// @desc    Delete food log entry
// @route   DELETE /api/logs/:id
// @access  Public
const deleteFoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await FoodLog.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({ success: false, message: 'Food log entry not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Food log entry deleted successfully.',
      data: deletedLog
    });
  } catch (error) {
    console.error('Error deleting food log:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting food log.' });
  }
};

module.exports = {
  addFoodLog,
  getDailyLogs,
  getHistoryLogs,
  getAnalytics,
  deleteFoodLog
};
