import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import NutritionCards from './components/NutritionCards';
import AlertBanner from './components/AlertBanner';
import FoodLogTable from './components/FoodLogTable';
import NutritionCharts from './components/NutritionCharts';
import AddFoodModal from './components/AddFoodModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import GoalSettingsModal from './components/GoalSettingsModal';
import HistoryView from './components/HistoryView';
import Toast from './components/Toast';
import { getDailyLogs, getAnalytics, getGoal } from './services/api';
import './App.css';

function App() {
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'add', 'scanner', 'analytics', 'history'
  const [dailyData, setDailyData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [currentGoal, setCurrentGoal] = useState({ dailyCalorieGoal: 2000, dailyCarbsGoal: 250, dailyProteinGoal: 100 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [prefilledFood, setPrefilledFood] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = ({ type, title, message }) => {
    setToast({ type, title, message });
  };

  // Fetch daily logs and summary
  const loadDailyLogs = async (date) => {
    try {
      const data = await getDailyLogs(date || selectedDate);
      if (data.success) {
        setDailyData(data);
      }
    } catch (err) {
      console.error('Failed to load daily logs:', err);
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to backend server. Make sure MongoDB and backend are running.'
      });
    }
  };

  // Fetch 7-day analytics
  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  // Fetch active user goal
  const loadGoal = async () => {
    try {
      const data = await getGoal();
      if (data.success && data.data) {
        setCurrentGoal(data.data);
      }
    } catch (err) {
      console.error('Failed to load goal:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadDailyLogs(selectedDate), loadAnalytics(), loadGoal()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    loadDailyLogs(selectedDate);
  }, [selectedDate]);

  // Handler when barcode scanner detects and selects a product
  const handleProductFromScanner = (product) => {
    setPrefilledFood(product);
    setIsScannerModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setPrefilledFood(null);
    setIsAddModalOpen(true);
  };

  const handleOpenScannerModal = () => {
    setIsScannerModalOpen(true);
  };

  const handleOpenGoalModal = () => {
    setIsGoalModalOpen(true);
  };

  const handleGoalUpdated = (newGoal) => {
    setCurrentGoal(newGoal);
    loadDailyLogs(selectedDate);
    loadAnalytics();
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Header & Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenScannerModal={handleOpenScannerModal}
        onOpenGoalModal={handleOpenGoalModal}
        selectedDate={selectedDate}
        dailyGoal={currentGoal?.dailyCalorieGoal || 2000}
      />

      {/* App Body Content */}
      <main className="main-content">
        {/* TAB 1: DASHBOARD (Nutrition Cards, Exceeded Calorie Alert, Daily Food Log, Quick Charts) */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view-container">
            {/* Warning Alert Banner (Appears when daily calories exceed target) */}
            <AlertBanner
              summary={dailyData?.summary}
              onOpenGoalModal={handleOpenGoalModal}
            />

            {/* Nutrition Cards: Calories, Remaining, Carbs, Protein, Goal */}
            <NutritionCards
              summary={dailyData?.summary}
              onOpenGoalModal={handleOpenGoalModal}
            />

            {/* Daily Food Log Table with Timestamps & Meal Breakdown */}
            <FoodLogTable
              logs={dailyData?.logs || []}
              summary={dailyData?.summary}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onOpenAddModal={handleOpenAddModal}
              onOpenScannerModal={handleOpenScannerModal}
              onLogDeleted={() => {
                loadDailyLogs(selectedDate);
                loadAnalytics();
              }}
              showToast={showToast}
            />

            {/* Quick Nutrition Charts Overview */}
            <section className="dashboard-charts-section">
              <div className="section-title-wrap mb-4">
                <h2 className="section-title">Nutrition Analytics & Trends</h2>
                <span className="section-subtitle">Weekly intake pattern and macronutrient distribution</span>
              </div>
              <NutritionCharts
                analyticsData={analyticsData}
                dailySummary={dailyData?.summary}
              />
            </section>
          </div>
        )}

        {/* TAB 2: ANALYTICS & CHARTS FULL VIEW */}
        {activeTab === 'analytics' && (
          <div className="analytics-view-container">
            <div className="section-title-wrap mb-4">
              <h2 className="section-title">Comprehensive Nutrition Statistics</h2>
              <p className="section-subtitle">
                Evaluate your calorie targets, macronutrient balance, and 7-day progress
              </p>
            </div>
            <NutritionCharts
              analyticsData={analyticsData}
              dailySummary={dailyData?.summary}
            />
          </div>
        )}

        {/* TAB 3: HISTORY VIEW (Browse up to 1 Year of Logs) */}
        {activeTab === 'history' && (
          <HistoryView showToast={showToast} />
        )}

        {/* TAB 4: ADD FOOD DIRECT VIEW (If tab clicked) */}
        {activeTab === 'add' && (
          <div className="direct-action-prompt">
            <div className="prompt-card">
              <h3>Manual Food Entry</h3>
              <p>Add a customized meal with precise calories, carbohydrates, and protein.</p>
              <button className="btn btn-primary btn-large mt-3" onClick={handleOpenAddModal}>
                Open Food Entry Form
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: SCANNER DIRECT VIEW (If tab clicked) */}
        {activeTab === 'scanner' && (
          <div className="direct-action-prompt">
            <div className="prompt-card">
              <h3>Package Barcode Scanner</h3>
              <p>Scan any food package or search our verified nutrition database.</p>
              <button className="btn btn-primary btn-large mt-3" onClick={handleOpenScannerModal}>
                Open Barcode Scanner
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledFood(null);
          if (activeTab === 'add') setActiveTab('dashboard');
        }}
        onFoodAdded={() => {
          loadDailyLogs(selectedDate);
          loadAnalytics();
        }}
        showToast={showToast}
        initialData={prefilledFood}
        selectedDate={selectedDate}
      />

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => {
          setIsScannerModalOpen(false);
          if (activeTab === 'scanner') setActiveTab('dashboard');
        }}
        onProductFound={handleProductFromScanner}
        showToast={showToast}
      />

      {/* Goal Settings Modal */}
      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={currentGoal}
        onGoalUpdated={handleGoalUpdated}
        showToast={showToast}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-title">
            NutriTrack • Nutrition & Diet Tracker (MERN Stack)
          </p>
          <p className="footer-tech">
            MongoDB • Express.js • React.js • Node.js
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
