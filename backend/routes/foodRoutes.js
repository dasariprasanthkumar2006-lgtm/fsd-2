const express = require('express');
const router = express.Router();
const {
  lookupBarcode,
  searchFoods,
  createFoodItem
} = require('../controllers/foodController');

router.get('/barcode/:barcode', lookupBarcode);
router.get('/search', searchFoods);
router.post('/', createFoodItem);

module.exports = router;
