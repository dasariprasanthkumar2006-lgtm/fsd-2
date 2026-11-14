const User = require('../models/User');
const { getOrCreateDefaultUser } = require('../utils/getOrCreateUser');

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await getOrCreateDefaultUser();
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};

module.exports = {
  getUserProfile
};
