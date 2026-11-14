# 🥗 NutriTrack - Nutrition & Diet Tracker (MERN Stack)

A simple, clean, and responsive **Nutrition & Diet Tracker Website** built exclusively with the **MERN stack**:
- **MongoDB** with **Mongoose**
- **Express.js**
- **React.js** (Vite + Modern React Hooks)
- **Node.js**

---

## 🌟 Key Features

1. **Intuitive Dashboard:** Displays today's total calories consumed, carbohydrates (g), protein (g), remaining calories, and interactive progress bars towards daily goals.
2. **Add Food Form:** Allows users to manually log foods with food name, serving quantity, calories, carbohydrates, protein, meal categories (Breakfast, Lunch, Dinner, Snack), and precise timestamps.
3. **Barcode Scanner for Packaged Foods:**
   - **Live Camera Scanner:** Direct in-browser barcode scanning using device camera (`html5-qrcode`).
   - **Manual Barcode Input:** Allows typing or pasting any barcode/EAN/UPC number with immediate OpenFoodFacts & verified database lookup.
   - **One-Click Sample Barcodes:** Pre-seeded with items like Nutella, Coca-Cola, Quaker Oats, Chobani Greek Yogurt, Whey Protein, Maggi Noodles, and Oreo Cookies.
4. **Daily Food Log:** Displays all added food entries for any selected date with exact timestamps, meal badges, calories, carbs, and protein chips, with delete support.
5. **Nutrition Charts:**
   - **7-Day Calorie Intake Bar Chart:** Visualizes daily calories compared to the daily calorie goal line, color-coding days within goal (green) vs days exceeded (red).
   - **Macronutrient Energy Doughnut Chart:** Breakdown of calories from Carbohydrates vs Protein vs other sources.
   - **Macronutrient Trend Bar Chart:** Compares daily Carbs (g) and Protein (g) over the past week.
6. **Daily Goal Setting:** Users can customize their daily calorie target (500 – 10,000 kcal) as well as carbohydrate and protein targets with quick presets (1500, 1800, 2000, 2200, 2500 kcal).
7. **Exceeded Calorie Goal Alerts:** Automatically displays an alert banner on the dashboard and toast notification when total calories exceed the set daily target.
8. **Food Limit Rule:** Prevents the same food from being logged more than **3 times per day** (case-insensitive backend validation).
9. **Duplicate Timestamp Prevention:** Prevents multiple food entries with the exact same timestamp (compound unique MongoDB index + backend pre-check).
10. **1-Year History & Archive:** Browse historical food logs for up to **1 full year (365 days)** with preset date filters (7d, 30d, 90d, 365d) or custom date pickers, with expandable day breakdowns and aggregate metrics.

---

## 📁 Project Structure

```text
mern/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose
│   ├── controllers/
│   │   ├── foodController.js     # Barcode lookup & food search logic
│   │   ├── foodLogController.js  # CRUD & validations (duplicate timestamp, 3x limit)
│   │   ├── goalController.js     # User daily goal management
│   │   └── userController.js     # Profile retrieval
│   ├── data/
│   │   └── seedData.js           # Sample packaged foods & historical test logs
│   ├── models/
│   │   ├── DailyGoal.js          # Mongoose model for daily goals
│   │   ├── FoodItem.js           # Mongoose model for packaged foods
│   │   ├── FoodLog.js            # Mongoose model for food entries (with unique timestamp index)
│   │   └── User.js               # Mongoose model for user profile & target goals
│   ├── routes/
│   │   ├── foodLogRoutes.js      # /api/logs endpoints
│   │   ├── foodRoutes.js         # /api/foods endpoints
│   │   ├── goalRoutes.js         # /api/goals endpoints
│   │   └── userRoutes.js         # /api/user endpoints
│   ├── utils/
│   │   └── getOrCreateUser.js    # Seamless default user bootstrap
│   ├── .env                      # Environment config (PORT, MONGODB_URI)
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AddFoodModal.jsx        # Food entry form with autocomplete & timestamp
│   │   │   ├── AlertBanner.jsx         # Calorie exceeded warning banner
│   │   │   ├── BarcodeScannerModal.jsx # Camera scanner & manual barcode lookup
│   │   │   ├── FoodLogTable.jsx        # Daily log table with date stepper & timestamps
│   │   │   ├── GoalSettingsModal.jsx   # Calorie & macro target settings
│   │   │   ├── Header.jsx              # Responsive navigation & brand header
│   │   │   ├── HistoryView.jsx         # 1-year archive with accordion days & stats
│   │   │   ├── NutritionCards.jsx      # Dashboard metric cards & progress bars
│   │   │   ├── NutritionCharts.jsx     # Chart.js weekly & macro charts
│   │   │   └── Toast.jsx               # Floating toast notifications
│   │   ├── services/
│   │   │   └── api.js                  # Axios client & REST API calls
│   │   ├── App.css                     # Modern, clean, responsive styling
│   │   ├── App.jsx                     # Main application layout & state
│   │   ├── index.css                   # CSS reset & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Vite configuration with /api reverse proxy
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Prerequisites

Before running the project locally, make sure you have:
1. **Node.js** (v18 or higher recommended, tested on v24.20)
2. **npm** (v9 or higher)
3. **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dasariprasanthkumar2006-lgtm/fsd-2.git
cd fsd-2
```

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify or configure `.env` (a default `.env` is provided):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/nutrition_diet_tracker
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *The server runs on `http://localhost:5000` and automatically connects to MongoDB and seeds initial sample foods & logs.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```text
   http://localhost:3000
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/logs` | Log a food entry (Validates: <= 3 times/day, unique timestamp, max 1yr age) |
| `GET` | `/api/logs/daily?date=YYYY-MM-DD` | Get day summary (total cal, carbs, protein, remaining, exceeded) & item list |
| `GET` | `/api/logs/history?startDate=...&endDate=...` | Get logs grouped by day for up to 365 days |
| `GET` | `/api/logs/analytics` | Get 7-day stats and today's macro energy distribution |
| `DELETE` | `/api/logs/:id` | Delete a food log entry |
| `GET` | `/api/goals` | Get current user's daily calorie and macro goals |
| `POST` | `/api/goals` | Update daily calorie goal (min 500, max 10,000 kcal) |
| `GET` | `/api/foods/barcode/:barcode` | Look up barcode via local DB and Open Food Facts API |
| `GET` | `/api/foods/search?q=...` | Search catalog foods by name or brand |

---

## 🛡️ Validation Rules Implemented

- **Food Limit (Rule 8):** Prevents logging the same food item (case-insensitive) more than **3 times in a single day**. If attempted, returns HTTP `400 Bad Request` with an explanatory message.
- **Duplicate Prevention (Rule 9):** Prevents multiple entries with the identical timestamp. Enforced via a compound unique index on `{ userId: 1, timestamp: 1 }` and pre-validation.
- **History Constraint (Rule 10):** Ensures food logs cannot be backdated or queried beyond **365 days (1 year)**.
- **Calorie Goal Limits (Rule 6 & 7):** Daily target must be between 500 and 10,000 kcal. When today's intake exceeds target, `isExceeded` triggers the dashboard warning banner.

---

## 📱 Mobile Responsive

- Designed mobile-first with adaptive grids, large tap targets, collapsible menus, and responsive tables.
- Built without external heavy UI libraries to guarantee fast loading and clean code maintenance.
