const FoodItem = require('../models/FoodItem');
const FoodLog = require('../models/FoodLog');
const { getOrCreateDefaultUser } = require('../utils/getOrCreateUser');

const sampleFoods = [
  {
    name: 'Quaker Rolled Oats',
    barcode: '028400064082',
    brand: 'Quaker',
    calories: 150,
    carbohydrates: 27,
    protein: 5,
    quantity: '40g (1/2 cup)',
    category: 'Breakfast'
  },
  {
    name: 'Greek Yogurt Plain Non-Fat',
    barcode: '011110038548',
    brand: 'Chobani',
    calories: 100,
    carbohydrates: 6,
    protein: 17,
    quantity: '170g (3/4 cup)',
    category: 'Breakfast'
  },
  {
    name: 'Whey Protein Powder Scoop',
    barcode: '074570084004',
    brand: 'Optimum Nutrition',
    calories: 120,
    carbohydrates: 3,
    protein: 24,
    quantity: '1 scoop (30g)',
    category: 'Snacks'
  },
  {
    name: 'Nature Valley Oats & Honey Bar',
    barcode: '070470001007',
    brand: 'Nature Valley',
    calories: 190,
    carbohydrates: 29,
    protein: 3,
    quantity: '2 bars (42g)',
    category: 'Snacks'
  },
  {
    name: 'Creamy Peanut Butter',
    barcode: '041570054231',
    brand: 'Skippy',
    calories: 190,
    carbohydrates: 7,
    protein: 8,
    quantity: '2 tbsp (32g)',
    category: 'General'
  },
  {
    name: 'Nutella Hazelnut Spread',
    barcode: '3017620422003',
    brand: 'Ferrero',
    calories: 100,
    carbohydrates: 11,
    protein: 1,
    quantity: '1 tbsp (18g)',
    category: 'Snacks'
  },
  {
    name: 'Maggi 2-Minute Masala Noodles',
    barcode: '8901030383701',
    brand: 'Nestle',
    calories: 310,
    carbohydrates: 42,
    protein: 7,
    quantity: '1 pack (70g)',
    category: 'Lunch'
  },
  {
    name: 'Coca-Cola Classic',
    barcode: '5449000000996',
    brand: 'Coca-Cola',
    calories: 139,
    carbohydrates: 35,
    protein: 0,
    quantity: '1 can (330ml)',
    category: 'Snacks'
  },
  {
    name: 'Oreo Original Cookies',
    barcode: '7622210449283',
    brand: 'Nabisco',
    calories: 160,
    carbohydrates: 25,
    protein: 1.5,
    quantity: '3 cookies (34g)',
    category: 'Snacks'
  },
  {
    name: 'Kelloggs Corn Flakes',
    barcode: '038000358210',
    brand: 'Kelloggs',
    calories: 115,
    carbohydrates: 26,
    protein: 2.5,
    quantity: '1 bowl (30g)',
    category: 'Breakfast'
  },
  {
    name: 'Grilled Chicken Breast',
    barcode: '',
    brand: 'Whole Food',
    calories: 165,
    carbohydrates: 0,
    protein: 31,
    quantity: '100g',
    category: 'Dinner'
  },
  {
    name: 'Brown Rice Cooked',
    barcode: '',
    brand: 'Whole Food',
    calories: 216,
    carbohydrates: 45,
    protein: 5,
    quantity: '1 cup (195g)',
    category: 'Lunch'
  },
  {
    name: 'Boiled Egg (Large)',
    barcode: '',
    brand: 'Farm Fresh',
    calories: 78,
    carbohydrates: 0.6,
    protein: 6.3,
    quantity: '1 egg (50g)',
    category: 'Breakfast'
  },
  {
    name: 'Banana (Medium)',
    barcode: '',
    brand: 'Fresh Produce',
    calories: 105,
    carbohydrates: 27,
    protein: 1.3,
    quantity: '1 medium (118g)',
    category: 'Snacks'
  },
  {
    name: 'Almonds Raw',
    barcode: '',
    brand: 'Whole Food',
    calories: 164,
    carbohydrates: 6,
    protein: 6,
    quantity: '1 ounce (28g / ~23 nuts)',
    category: 'Snacks'
  }
];

const seedDatabase = async () => {
  try {
    const user = await getOrCreateDefaultUser();
    const count = await FoodItem.countDocuments();
    if (count === 0) {
      await FoodItem.insertMany(sampleFoods);
      console.log(`Seeded ${sampleFoods.length} sample food and packaged items.`);
    }

    // Seed a few past days of logs if there are fewer than 8 total logs in the database
    const logCount = await FoodLog.countDocuments();
    if (logCount < 8) {
      const pastLogs = [];
      const pastDaysData = [
        {
          offsetDays: 1,
          items: [
            { name: 'Quaker Rolled Oats', qty: '1 bowl', cal: 150, carbs: 27, protein: 5, meal: 'Breakfast', timeStr: '08:15:00' },
            { name: 'Brown Rice Cooked', qty: '1.5 cups', cal: 324, carbs: 67, protein: 7.5, meal: 'Lunch', timeStr: '13:00:00' },
            { name: 'Grilled Chicken Breast', qty: '150g', cal: 248, carbs: 0, protein: 46.5, meal: 'Lunch', timeStr: '13:10:00' },
            { name: 'Nature Valley Oats & Honey Bar', qty: '2 bars', cal: 190, carbs: 29, protein: 3, meal: 'Snack', timeStr: '17:30:00' },
            { name: 'Greek Yogurt Plain Non-Fat', qty: '200g', cal: 120, carbs: 7.2, protein: 20.4, meal: 'Dinner', timeStr: '20:15:00' }
          ]
        },
        {
          offsetDays: 2,
          items: [
            { name: 'Boiled Egg (Large)', qty: '2 eggs', cal: 156, carbs: 1.2, protein: 12.6, meal: 'Breakfast', timeStr: '08:30:00' },
            { name: 'Quaker Rolled Oats', qty: '1 bowl', cal: 150, carbs: 27, protein: 5, meal: 'Breakfast', timeStr: '08:45:00' },
            { name: 'Brown Rice Cooked', qty: '1 cup', cal: 216, carbs: 45, protein: 5, meal: 'Lunch', timeStr: '12:30:00' },
            { name: 'Grilled Chicken Breast', qty: '200g', cal: 330, carbs: 0, protein: 62, meal: 'Lunch', timeStr: '12:40:00' },
            { name: 'Almonds Raw', qty: '28g', cal: 164, carbs: 6, protein: 6, meal: 'Snack', timeStr: '16:00:00' }
          ]
        },
        {
          offsetDays: 3,
          items: [
            { name: 'Greek Yogurt Plain Non-Fat', qty: '170g', cal: 100, carbs: 6, protein: 17, meal: 'Breakfast', timeStr: '09:00:00' },
            { name: 'Whey Protein Powder Scoop', qty: '1 scoop', cal: 120, carbs: 3, protein: 24, meal: 'Snack', timeStr: '11:30:00' },
            { name: 'Maggi 2-Minute Masala Noodles', qty: '1 pack', cal: 310, carbs: 42, protein: 7, meal: 'Lunch', timeStr: '13:15:00' },
            { name: 'Creamy Peanut Butter', qty: '2 tbsp', cal: 190, carbs: 7, protein: 8, meal: 'Snack', timeStr: '18:00:00' }
          ]
        }
      ];

      for (const day of pastDaysData) {
        const d = new Date();
        d.setDate(d.getDate() - day.offsetDays);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;

        for (const item of day.items) {
          const timestamp = new Date(`${dateString}T${item.timeStr}.000Z`);
          // Check if timestamp already exists
          const exists = await FoodLog.findOne({ userId: user._id, timestamp });
          if (!exists) {
            pastLogs.push({
              userId: user._id,
              foodName: item.name,
              quantity: item.qty,
              calories: item.cal,
              carbohydrates: item.carbs,
              protein: item.protein,
              mealType: item.meal,
              barcode: '',
              timestamp,
              dateString
            });
          }
        }
      }

      if (pastLogs.length > 0) {
        await FoodLog.insertMany(pastLogs);
        console.log(`Seeded ${pastLogs.length} initial historical logs.`);
      }
    }
  } catch (err) {
    console.error('Error seeding foods:', err.message);
  }
};

module.exports = { seedDatabase, sampleFoods };
