const express = require('express');
const router = express.Router();
const {
  addFoodLog,
  getDailyLogs,
  getHistoryLogs,
  getAnalytics,
  deleteFoodLog
} = require('../controllers/foodLogController');

router.post('/', addFoodLog);
router.get('/daily', getDailyLogs);
router.get('/history', getHistoryLogs);
router.get('/analytics', getAnalytics);
router.delete('/:id', deleteFoodLog);

module.exports = router;
