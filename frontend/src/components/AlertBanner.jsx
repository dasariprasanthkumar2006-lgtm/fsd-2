import React from 'react';
import { AlertTriangle, Flame, ArrowUpRight } from 'lucide-react';

export default function AlertBanner({ summary, onOpenGoalModal }) {
  if (!summary || !summary.isExceeded) {
    return null;
  }

  const { totalCalories, calorieGoal, exceededBy } = summary;

  return (
    <div className="calorie-alert-banner" role="alert">
      <div className="alert-icon-container">
        <AlertTriangle className="alert-icon" size={28} />
      </div>
      <div className="alert-details">
        <div className="alert-header">
          <span className="alert-badge">Warning: Goal Exceeded</span>
          <span className="alert-time">Today's Intake Limit</span>
        </div>
        <h3 className="alert-title">
          You have exceeded your daily calorie goal by <strong className="text-red-highlight">{exceededBy} kcal</strong>!
        </h3>
        <p className="alert-description">
          Total consumed today is <strong>{totalCalories} kcal</strong> against your target of{' '}
          <strong>{calorieGoal} kcal</strong> ({Math.round((totalCalories / calorieGoal) * 100)}% of goal).
          Consider choosing lighter snacks or balancing with physical activity.
        </p>
      </div>
      <div className="alert-actions">
        <button
          className="btn-alert-adjust"
          onClick={onOpenGoalModal}
          title="Adjust your daily target"
        >
          <span>Adjust Goal</span>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
