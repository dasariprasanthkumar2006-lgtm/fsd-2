const User = require('../models/User');

const getOrCreateDefaultUser = async () => {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      name: 'Health Enthusiast',
      email: 'demo@nutritiontracker.com',
      dailyCalorieGoal: 2000,
      dailyCarbsGoal: 250,
      dailyProteinGoal: 100
    });
    console.log('Created default user:', user.name);
  }
  return user;
};

module.exports = { getOrCreateDefaultUser };
