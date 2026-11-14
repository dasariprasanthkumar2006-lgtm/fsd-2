import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Search, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { addFoodLog, searchFoods } from '../services/api';

export default function AddFoodModal({
  isOpen,
  onClose,
  onFoodAdded,
  showToast,
  initialData = null,
  selectedDate = null
}) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [protein, setProtein] = useState('');
  const [mealType, setMealType] = useState('Snack');
  const [customTimestamp, setCustomTimestamp] = useState('');
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format current local datetime for datetime-local input: YYYY-MM-DDTHH:mm:ss
  const getCurrentLocalISOString = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  // Populate initial data if provided (e.g. from Barcode Scanner or Quick Add)
  useEffect(() => {
    if (initialData) {
      setFoodName(initialData.name || '');
      setQuantity(initialData.quantity || '1 serving');
      setCalories(initialData.calories !== undefined ? String(initialData.calories) : '');
      setCarbohydrates(initialData.carbohydrates !== undefined ? String(initialData.carbohydrates) : '');
      setProtein(initialData.protein !== undefined ? String(initialData.protein) : '');
      setMealType(initialData.mealType || initialData.category || 'Snack');
      setBarcode(initialData.barcode || '');
    } else {
      resetForm();
    }
    setCustomTimestamp(getCurrentLocalISOString());
    setErrorMessage('');
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFoodName('');
    setQuantity('1 serving');
    setCalories('');
    setCarbohydrates('');
    setProtein('');
    setMealType('Snack');
    setCustomTimestamp(getCurrentLocalISOString());
    setBarcode('');
    setErrorMessage('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Autocomplete food suggestions
  const handleFoodNameChange = async (e) => {
    const val = e.target.value;
    setFoodName(val);
    setErrorMessage('');

    if (val.trim().length >= 2) {
      try {
        const res = await searchFoods(val.trim());
        if (res.success && res.data.length > 0) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setFoodName(item.name);
    setCalories(String(item.calories));
    setCarbohydrates(String(item.carbohydrates));
    setProtein(String(item.protein));
    if (item.quantity) setQuantity(item.quantity);
    if (item.barcode) setBarcode(item.barcode);
    if (item.category && ['Breakfast', 'Lunch', 'Dinner', 'Snack'].includes(item.category)) {
      setMealType(item.category);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!foodName.trim()) {
      setErrorMessage('Please enter the food name.');
      return;
    }
    if (!quantity.trim()) {
      setErrorMessage('Please specify the quantity or serving size.');
      return;
    }
    if (calories === '' || isNaN(Number(calories)) || Number(calories) < 0) {
      setErrorMessage('Please enter a valid non-negative calorie amount.');
      return;
    }
    if (carbohydrates === '' || isNaN(Number(carbohydrates)) || Number(carbohydrates) < 0) {
      setErrorMessage('Please enter a valid non-negative carbohydrate amount.');
      return;
    }
    if (protein === '' || isNaN(Number(protein)) || Number(protein) < 0) {
      setErrorMessage('Please enter a valid non-negative protein amount.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        foodName: foodName.trim(),
        quantity: quantity.trim(),
        calories: Number(calories),
        carbohydrates: Number(carbohydrates),
        protein: Number(protein),
        mealType,
        barcode: barcode || '',
        timestamp: customTimestamp ? new Date(customTimestamp).toISOString() : new Date().toISOString()
      };

      const result = await addFoodLog(payload);

      if (result.success) {
        const isExceeded = result.dailySummary?.isExceeded;
        showToast({
          type: isExceeded ? 'warning' : 'success',
          title: isExceeded ? 'Daily Goal Exceeded!' : 'Food Logged',
          message: result.message || `${foodName} added to your daily log.`
        });
        resetForm();
        onFoodAdded();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add food log.';
      setErrorMessage(msg);
      showToast({
        type: 'error',
        title: 'Error Logging Food',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge">
              <PlusCircle size={22} />
            </div>
            <div>
              <h2 className="modal-title">Log Food Entry</h2>
              <p className="modal-subtitle">Manually add nutrition details to your daily log</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="modal-error-box" role="alert">
            <AlertCircle size={20} className="text-red-500" />
            <div className="modal-error-text">
              <strong>Action Blocked:</strong> {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Food Name with Auto-suggestions */}
          <div className="form-group relative-position">
            <label className="form-label">
              Food Item Name <span className="text-required">*</span>
            </label>
            <div className="input-with-icon">
              <Search className="input-left-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Grilled Chicken, Oatmeal, Apple"
                value={foodName}
                onChange={handleFoodNameChange}
                required
                autoFocus
              />
            </div>

            {/* Suggestions list */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((item) => (
                  <li
                    key={item._id}
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item)}
                  >
                    <div className="suggestion-info">
                      <span className="suggestion-name">{item.name}</span>
                      <span className="suggestion-sub">
                        {item.brand ? `${item.brand} • ` : ''}
                        {item.quantity}
                      </span>
                    </div>
                    <div className="suggestion-macros">
                      <span className="macro-chip-cal">{item.calories} kcal</span>
                      <span className="macro-chip-carb">{item.carbohydrates}g C</span>
                      <span className="macro-chip-pro">{item.protein}g P</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity & Meal Type */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                Quantity / Portion <span className="text-required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 1 cup, 150g, 2 slices"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meal Category</label>
              <select
                className="form-select"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="macros-input-grid">
            <div className="form-group macro-field-cal">
              <label className="form-label">
                Calories (kcal) <span className="text-required">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 250"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>

            <div className="form-group macro-field-carbs">
              <label className="form-label">
                Carbs (g) <span className="text-required">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 30"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                required
              />
            </div>

            <div className="form-group macro-field-protein">
              <label className="form-label">
                Protein (g) <span className="text-required">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                placeholder="e.g. 20"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Timestamp picker (Duplicate Timestamp Prevention & Exact Audit) */}
          <div className="form-group">
            <label className="form-label">
              <span className="flex items-center gap-1">
                <Clock size={16} /> Entry Timestamp
              </span>
              <span className="form-hint">(Prevents duplicate entries with identical timestamps)</span>
            </label>
            <input
              type="datetime-local"
              step="1"
              className="form-input"
              value={customTimestamp}
              onChange={(e) => setCustomTimestamp(e.target.value)}
              required
            />
          </div>

          {barcode && (
            <div className="barcode-tag-info">
              <span>Scanned Barcode: <strong>{barcode}</strong></span>
            </div>
          )}

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
              <PlusCircle size={18} />
              <span>{loading ? 'Logging Entry...' : 'Save Food to Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
