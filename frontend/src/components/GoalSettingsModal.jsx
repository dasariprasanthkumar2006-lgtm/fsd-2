import React, { useState, useEffect } from 'react';
import { Target, X, Check, Sparkles, AlertCircle } from 'lucide-react';
import { updateGoal } from '../services/api';

export default function GoalSettingsModal({
  isOpen,
  onClose,
  currentGoal,
  onGoalUpdated,
  showToast
}) {
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [carbsGoal, setCarbsGoal] = useState(250);
  const [proteinGoal, setProteinGoal] = useState(100);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const caloriePresets = [1500, 1800, 2000, 2200, 2500, 3000];

  useEffect(() => {
    if (currentGoal) {
      setCalorieGoal(currentGoal.dailyCalorieGoal || 2000);
      setCarbsGoal(currentGoal.dailyCarbsGoal || 250);
      setProteinGoal(currentGoal.dailyProteinGoal || 100);
    }
    setErrorMessage('');
  }, [currentGoal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetCal = Number(calorieGoal);
    if (isNaN(targetCal) || targetCal < 500 || targetCal > 10000) {
      setErrorMessage('Daily calorie goal must be between 500 and 10,000 kcal.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateGoal({
        dailyCalorieGoal: targetCal,
        dailyCarbsGoal: Number(carbsGoal) || 250,
        dailyProteinGoal: Number(proteinGoal) || 100
      });

      if (res.success) {
        showToast({
          type: 'success',
          title: 'Goal Updated',
          message: `Daily calorie goal set to ${targetCal} kcal.`
        });
        onGoalUpdated(res.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update goal.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Error Updating Goal',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card goal-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge icon-goal">
              <Target size={22} />
            </div>
            <div>
              <h2 className="modal-title">Set Daily Nutrition Goals</h2>
              <p className="modal-subtitle">Define your target calorie and macro limits</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="modal-error-box" role="alert">
            <AlertCircle size={20} className="text-red-500" />
            <div className="modal-error-text">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Calorie Goal Input */}
          <div className="form-group">
            <label className="form-label">
              Daily Calorie Target (kcal) <span className="text-required">*</span>
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              step="50"
              className="form-input form-input-lg"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              required
            />
            <span className="form-hint">Accepted range: 500 – 10,000 kcal per day</span>
          </div>

          {/* Quick Presets */}
          <div className="presets-group">
            <span className="presets-label">Quick Presets:</span>
            <div className="preset-buttons-row">
              {caloriePresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`preset-btn ${Number(calorieGoal) === val ? 'active' : ''}`}
                  onClick={() => setCalorieGoal(val)}
                >
                  {val} kcal
                </button>
              ))}
            </div>
          </div>

          {/* Macro Targets */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Carbohydrates Target (g)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Protein Target (g)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
              />
            </div>
          </div>

          <div className="form-action-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              <Check size={18} />
              <span>{loading ? 'Saving...' : 'Save Goals'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
