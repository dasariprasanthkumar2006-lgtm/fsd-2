const express = require('express');
const router = express.Router();
const { getGoal, updateGoal } = require('../controllers/goalController');

router.get('/', getGoal);
router.post('/', updateGoal);
router.put('/', updateGoal);

module.exports = router;
