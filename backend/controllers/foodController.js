const axios = require('axios');
const FoodItem = require('../models/FoodItem');

// @desc    Lookup food item by barcode
// @route   GET /api/foods/barcode/:barcode
// @access  Public
const lookupBarcode = async (req, res) => {
  const rawBarcode = req.params.barcode ? req.params.barcode.trim() : '';

  if (!rawBarcode) {
    return res.status(400).json({ success: false, message: 'Barcode is required.' });
  }

  try {
    // 1. Check local database
    const localFood = await FoodItem.findOne({ barcode: rawBarcode });
    if (localFood) {
      return res.status(200).json({
        success: true,
        source: 'local_database',
        data: localFood
      });
    }

    // 2. Query OpenFoodFacts API
    try {
      const offUrl = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(rawBarcode)}.json`;
      const response = await axios.get(offUrl, {
        timeout: 4000,
        headers: {
          'User-Agent': 'NutritionDietTrackerMERN - Version1.0 (Contact: support@nutritiontracker.local)'
        }
      });

      if (response.data && response.data.status === 1 && response.data.product) {
        const prod = response.data.product;
        const nutriments = prod.nutriments || {};

        // Extract calories (kcal)
        let calories =
          nutriments['energy-kcal_100g'] ||
          nutriments['energy-kcal_serving'] ||
          nutriments['energy-kcal'] ||
          (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

        // Extract carbohydrates
        let carbs =
          nutriments['carbohydrates_100g'] ||
          nutriments['carbohydrates_serving'] ||
          nutriments['carbohydrates'] ||
          0;

        // Extract protein
        let protein =
          nutriments['proteins_100g'] ||
          nutriments['proteins_serving'] ||
          nutriments['proteins'] ||
          0;

        const name =
          prod.product_name ||
          prod.product_name_en ||
          prod.generic_name ||
          `Packaged Food (${rawBarcode})`;

        const brand = prod.brands || '';
        const serving = prod.serving_size || '100g';

        const newFoodItem = await FoodItem.create({
          name: name.trim(),
          barcode: rawBarcode,
          brand: brand.trim(),
          calories: Math.round(Number(calories) || 0),
          carbohydrates: Math.round((Number(carbs) || 0) * 10) / 10,
          protein: Math.round((Number(protein) || 0) * 10) / 10,
          quantity: serving,
          category: 'Packaged'
        });

        return res.status(200).json({
          success: true,
          source: 'openfoodfacts',
          data: newFoodItem
        });
      }
    } catch (apiErr) {
      console.log('OpenFoodFacts API query fallback:', apiErr.message);
    }

    // If not found in either
    return res.status(404).json({
      success: false,
      message: `No nutrition data found for barcode "${rawBarcode}". You can manually enter the food details below.`,
      barcode: rawBarcode
    });
  } catch (error) {
    console.error('Error looking up barcode:', error);
    return res.status(500).json({ success: false, message: 'Server error looking up barcode.' });
  }
};

// @desc    Search foods by keyword
// @route   GET /api/foods/search
// @access  Public
const searchFoods = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      const items = await FoodItem.find().limit(20);
      return res.status(200).json({ success: true, count: items.length, data: items });
    }

    const regex = new RegExp(q.trim(), 'i');
    const items = await FoodItem.find({
      $or: [{ name: regex }, { brand: regex }, { barcode: regex }]
    }).limit(20);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    return res.status(500).json({ success: false, message: 'Server error searching foods.' });
  }
};

// @desc    Create custom food item
// @route   POST /api/foods
// @access  Public
const createFoodItem = async (req, res) => {
  try {
    const { name, calories, carbohydrates, protein, quantity, brand, barcode, category } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Food name is required.' });
    }

    const item = await FoodItem.create({
      name: name.trim(),
      calories: Math.max(0, Number(calories) || 0),
      carbohydrates: Math.max(0, Number(carbohydrates) || 0),
      protein: Math.max(0, Number(protein) || 0),
      quantity: quantity || '1 serving',
      brand: brand || '',
      barcode: barcode || '',
      category: category || 'General'
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating food item:', error);
    return res.status(500).json({ success: false, message: 'Server error creating food item.' });
  }
};

module.exports = {
  lookupBarcode,
  searchFoods,
  createFoodItem
};
