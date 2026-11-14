import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart as PieIcon, TrendingUp, Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function NutritionCharts({ analyticsData, dailySummary }) {
  if (!analyticsData) {
    return (
      <div className="charts-loading">
        <p>Loading nutrition statistics...</p>
      </div>
    );
  }

  const { weeklyStats = [], calorieGoal = 2000, todayMacros } = analyticsData;

  // 1. Weekly Calorie Bar Chart
  const weeklyLabels = weeklyStats.map((item) => item.dayLabel || item.date);
  const weeklyCalories = weeklyStats.map((item) => item.calories);
  const weeklyGoals = weeklyStats.map(() => calorieGoal);

  const barBackgroundColors = weeklyStats.map((item) =>
    item.calories > calorieGoal ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'
  );

  const weeklyCaloriesChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        type: 'bar',
        label: 'Calories Consumed (kcal)',
        data: weeklyCalories,
        backgroundColor: barBackgroundColors,
        borderRadius: 6,
        barPercentage: 0.6
      },
      {
        type: 'line',
        label: `Calorie Goal (${calorieGoal} kcal)`,
        data: weeklyGoals,
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const weeklyCaloriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'inherit', size: 12 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const stat = weeklyStats[index];
            if (!stat) return '';
            const status = stat.calories > calorieGoal
              ? `⚠️ Exceeded goal by ${stat.calories - calorieGoal} kcal`
              : `✓ ${calorieGoal - stat.calories} kcal remaining`;
            return `Carbs: ${stat.carbs}g | Protein: ${stat.protein}g\n${status}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // 2. Macronutrient Doughnut Chart (Carbohydrates vs Protein)
  const totalCarbsGrams = dailySummary?.totalCarbs || 0;
  const totalProteinGrams = dailySummary?.totalProtein || 0;

  // Carbs = 4 kcal/g, Protein = 4 kcal/g
  const carbsCalories = Math.round(totalCarbsGrams * 4);
  const proteinCalories = Math.round(totalProteinGrams * 4);
  const totalCaloriesLogged = dailySummary?.totalCalories || 0;
  const otherCalories = Math.max(0, totalCaloriesLogged - (carbsCalories + proteinCalories));

  const macroDoughnutData = {
    labels: ['Carbohydrates', 'Protein', 'Fats / Other'],
    datasets: [
      {
        data: totalCaloriesLogged > 0 ? [carbsCalories, proteinCalories, otherCalories] : [50, 30, 20],
        backgroundColor: [
          'rgba(59, 130, 246, 0.85)', // Blue for Carbs
          'rgba(16, 185, 129, 0.85)', // Green for Protein
          'rgba(245, 158, 11, 0.85)'  // Amber for Other
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const macroDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'inherit', size: 12 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} kcal`;
          }
        }
      }
    },
    cutout: '68%'
  };

  // 3. Daily Macronutrients Bar Chart (Carbs & Protein per day)
  const macroBarData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Carbohydrates (g)',
        data: weeklyStats.map((item) => item.carbs),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4
      },
      {
        label: 'Protein (g)',
        data: weeklyStats.map((item) => item.protein),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 4
      }
    ]
  };

  const macroBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 11 }, usePointStyle: true }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="nutrition-charts-wrapper">
      <div className="charts-grid">
        {/* Weekly Calorie Breakdown Bar Chart */}
        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <div className="chart-card-title-group">
              <BarChart3 size={20} className="text-emerald-600" />
              <div>
                <h3 className="chart-title">Weekly Calorie Intake & Goal Comparison</h3>
                <span className="chart-subtitle">
                  Last 7 days daily calories compared against target ({calorieGoal} kcal)
                </span>
              </div>
            </div>
            <span className="chart-badge">7-Day Trend</span>
          </div>

          <div className="chart-canvas-container" style={{ height: '280px' }}>
            <Bar data={weeklyCaloriesChartData} options={weeklyCaloriesOptions} />
          </div>

          <div className="chart-legend-notes">
            <span className="legend-indicator">
              <span className="dot dot-green"></span> Within Goal
            </span>
            <span className="legend-indicator">
              <span className="dot dot-red"></span> Goal Exceeded
            </span>
            <span className="legend-indicator">
              <span className="dot dot-dashed"></span> Target Goal Line
            </span>
          </div>
        </div>

        {/* Today's Macronutrient Doughnut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title-group">
              <PieIcon size={20} className="text-blue-600" />
              <div>
                <h3 className="chart-title">Macronutrient Energy Distribution</h3>
                <span className="chart-subtitle">Today's ratio of Carbs & Protein calories</span>
              </div>
            </div>
          </div>

          <div className="chart-canvas-container" style={{ height: '230px', position: 'relative' }}>
            <Doughnut data={macroDoughnutData} options={macroDoughnutOptions} />
            <div className="doughnut-center-info">
              <span className="doughnut-total-cal">{Math.round(totalCaloriesLogged)}</span>
              <span className="doughnut-label">Total kcal</span>
            </div>
          </div>

          <div className="macro-summary-pills">
            <div className="macro-pill pill-carbs">
              <span>Carbs</span>
              <strong>{totalCarbsGrams}g ({carbsCalories} kcal)</strong>
            </div>
            <div className="macro-pill pill-protein">
              <span>Protein</span>
              <strong>{totalProteinGrams}g ({proteinCalories} kcal)</strong>
            </div>
          </div>
        </div>

        {/* 7-Day Macro Grams Comparison Bar Chart */}
        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <div className="chart-card-title-group">
              <TrendingUp size={20} className="text-purple-600" />
              <div>
                <h3 className="chart-title">Daily Macronutrient Breakdown (Last 7 Days)</h3>
                <span className="chart-subtitle">Carbohydrates and protein daily intake trend</span>
              </div>
            </div>
          </div>

          <div className="chart-canvas-container" style={{ height: '240px' }}>
            <Bar data={macroBarData} options={macroBarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
