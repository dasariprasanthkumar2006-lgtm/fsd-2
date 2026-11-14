import React from 'react';
import { Flame, PieChart, Beef, Wheat, Target, Edit3 } from 'lucide-react';

export default function NutritionCards({ summary, onOpenGoalModal }) {
  if (!summary) return null;

  const {
    totalCalories = 0,
    totalCarbs = 0,
    totalProtein = 0,
    calorieGoal = 2000,
    carbsGoal = 250,
    proteinGoal = 100,
    remainingCalories = 0,
    isExceeded = false,
    exceededBy = 0
  } = summary;

  // Percentage calculations
  const caloriePercent = Math.min(100, Math.round((totalCalories / (calorieGoal || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / (carbsGoal || 1)) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / (proteinGoal || 1)) * 100));

  return (
    <div className="nutrition-cards-grid">
      {/* 1. Total Calories */}
      <div className="nutrition-card calorie-card">
        <div className="card-top">
          <div className="card-icon-pill icon-flame">
            <Flame size={22} />
          </div>
          <span className="card-badge">{caloriePercent}% consumed</span>
        </div>
        <div className="card-content">
          <span className="card-label">Calories Consumed</span>
          <div className="card-value-row">
            <span className="card-value">{Math.round(totalCalories)}</span>
            <span className="card-unit">kcal</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${isExceeded ? 'bar-exceeded' : 'bar-calories'}`}
              style={{ width: `${Math.min(100, (totalCalories / calorieGoal) * 100)}%` }}
            ></div>
          </div>
          <div className="card-footer-text">
            <span>Goal: {calorieGoal} kcal</span>
            <span>{isExceeded ? 'Exceeded' : `${remainingCalories} kcal left`}</span>
          </div>
        </div>
      </div>

      {/* 2. Remaining Calories */}
      <div className={`nutrition-card remaining-card ${isExceeded ? 'card-exceeded-state' : ''}`}>
        <div className="card-top">
          <div className={`card-icon-pill ${isExceeded ? 'icon-warning' : 'icon-remaining'}`}>
            <PieChart size={22} />
          </div>
          <span className={`card-badge ${isExceeded ? 'badge-alert' : 'badge-safe'}`}>
            {isExceeded ? 'OVER LIMIT' : 'ON TRACK'}
          </span>
        </div>
        <div className="card-content">
          <span className="card-label">{isExceeded ? 'Calories Exceeded' : 'Remaining Calories'}</span>
          <div className="card-value-row">
            <span className={`card-value ${isExceeded ? 'text-danger' : 'text-primary'}`}>
              {isExceeded ? `+${exceededBy}` : Math.max(0, Math.round(remainingCalories))}
            </span>
            <span className="card-unit">kcal</span>
          </div>
          <p className="card-sub-description">
            {isExceeded
              ? `You are ${exceededBy} kcal above your daily target.`
              : `You can still consume ${Math.round(remainingCalories)} kcal today.`}
          </p>
        </div>
      </div>

      {/* 3. Carbohydrates */}
      <div className="nutrition-card carbs-card">
        <div className="card-top">
          <div className="card-icon-pill icon-wheat">
            <Wheat size={22} />
          </div>
          <span className="card-badge">{carbsPercent}%</span>
        </div>
        <div className="card-content">
          <span className="card-label">Carbohydrates</span>
          <div className="card-value-row">
            <span className="card-value">{Math.round(totalCarbs)}</span>
            <span className="card-unit">g</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill bar-carbs"
              style={{ width: `${carbsPercent}%` }}
            ></div>
          </div>
          <div className="card-footer-text">
            <span>Target: {carbsGoal}g</span>
            <span>{Math.round(totalCarbs * 4)} kcal energy</span>
          </div>
        </div>
      </div>

      {/* 4. Protein */}
      <div className="nutrition-card protein-card">
        <div className="card-top">
          <div className="card-icon-pill icon-beef">
            <Beef size={22} />
          </div>
          <span className="card-badge">{proteinPercent}%</span>
        </div>
        <div className="card-content">
          <span className="card-label">Protein</span>
          <div className="card-value-row">
            <span className="card-value">{Math.round(totalProtein)}</span>
            <span className="card-unit">g</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill bar-protein"
              style={{ width: `${proteinPercent}%` }}
            ></div>
          </div>
          <div className="card-footer-text">
            <span>Target: {proteinGoal}g</span>
            <span>{Math.round(totalProtein * 4)} kcal energy</span>
          </div>
        </div>
      </div>

      {/* 5. Target / Daily Goal Card */}
      <div className="nutrition-card goal-card">
        <div className="card-top">
          <div className="card-icon-pill icon-target">
            <Target size={22} />
          </div>
          <button className="card-edit-btn" onClick={onOpenGoalModal} title="Edit target">
            <Edit3 size={15} />
            <span>Edit</span>
          </button>
        </div>
        <div className="card-content">
          <span className="card-label">Daily Calorie Target</span>
          <div className="card-value-row">
            <span className="card-value">{calorieGoal}</span>
            <span className="card-unit">kcal / day</span>
          </div>
          <p className="card-sub-description">
            Tap edit to customize your personal caloric maintenance or deficit target.
          </p>
        </div>
      </div>
    </div>
  );
}
