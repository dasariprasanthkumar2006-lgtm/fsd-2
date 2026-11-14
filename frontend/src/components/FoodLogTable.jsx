import React from 'react';
import {
  Clock,
  Trash2,
  Utensils,
  PlusCircle,
  QrCode,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Wheat,
  Beef
} from 'lucide-react';
import { deleteFoodLog } from '../services/api';

export default function FoodLogTable({
  logs,
  summary,
  selectedDate,
  onDateChange,
  onOpenAddModal,
  onOpenScannerModal,
  onLogDeleted,
  showToast
}) {
  const handleDelete = async (id, foodName) => {
    if (!window.confirm(`Are you sure you want to remove "${foodName}" from this log?`)) {
      return;
    }

    try {
      const res = await deleteFoodLog(id);
      if (res.success) {
        showToast({
          type: 'info',
          title: 'Food Removed',
          message: `"${foodName}" was deleted from your log.`
        });
        onLogDeleted();
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error Deleting',
        message: err.message || 'Could not delete entry.'
      });
    }
  };

  // Helper to step date backwards or forwards
  const handleStepDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const isToday =
    selectedDate === new Date().toISOString().split('T')[0];

  const formatTimestamp = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getMealBadgeClass = (mealType) => {
    switch (mealType) {
      case 'Breakfast':
        return 'badge-breakfast';
      case 'Lunch':
        return 'badge-lunch';
      case 'Dinner':
        return 'badge-dinner';
      default:
        return 'badge-snack';
    }
  };

  return (
    <div className="food-log-section">
      {/* Section Header with Date Stepper */}
      <div className="section-header-row">
        <div className="section-title-wrap">
          <h2 className="section-title">
            <Utensils size={22} className="text-emerald-600" />
            <span>Daily Food Log</span>
          </h2>
          <span className="section-subtitle">
            {logs?.length || 0} {logs?.length === 1 ? 'entry' : 'entries'} logged for this date
          </span>
        </div>

        {/* Date Selector & Navigation */}
        <div className="date-stepper-wrap">
          <button
            className="stepper-btn"
            onClick={() => handleStepDate(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="date-picker-box">
            <Calendar size={16} className="text-muted" />
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {isToday && <span className="today-chip">Today</span>}
          </div>

          <button
            className="stepper-btn"
            onClick={() => handleStepDate(1)}
            disabled={isToday}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="section-action-btns">
          <button
            className="btn btn-secondary"
            onClick={onOpenScannerModal}
          >
            <QrCode size={18} />
            <span>Scan Barcode</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={onOpenAddModal}
          >
            <PlusCircle size={18} />
            <span>Add Food</span>
          </button>
        </div>
      </div>

      {/* Table / List of Entries */}
      {!logs || logs.length === 0 ? (
        <div className="empty-log-state">
          <div className="empty-icon-circle">
            <Utensils size={40} className="text-muted" />
          </div>
          <h3 className="empty-state-title">No foods logged for this day</h3>
          <p className="empty-state-desc">
            Keep track of your calories, carbohydrates, and protein by adding your meals.
          </p>
          <div className="empty-state-actions">
            <button className="btn btn-primary btn-large" onClick={onOpenAddModal}>
              <PlusCircle size={18} />
              <span>Log Your First Meal</span>
            </button>
            <button className="btn btn-secondary btn-large" onClick={onOpenScannerModal}>
              <QrCode size={18} />
              <span>Scan Barcode</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="food-log-table">
            <thead>
              <tr>
                <th>Time & Timestamp</th>
                <th>Meal</th>
                <th>Food Item</th>
                <th>Portion</th>
                <th>Calories</th>
                <th>Carbs</th>
                <th>Protein</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item._id} className="log-table-row">
                  <td className="log-time-col">
                    <div className="time-display">
                      <Clock size={14} className="text-muted" />
                      <span className="time-text">{formatTimestamp(item.timestamp)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`meal-badge ${getMealBadgeClass(item.mealType)}`}>
                      {item.mealType || 'Snack'}
                    </span>
                  </td>
                  <td className="log-food-name-col">
                    <span className="food-name-text">{item.foodName}</span>
                    {item.barcode && (
                      <span className="table-barcode-tag">Barcode: {item.barcode}</span>
                    )}
                  </td>
                  <td className="log-quantity-col">
                    <span className="quantity-text">{item.quantity}</span>
                  </td>
                  <td className="log-cal-col">
                    <span className="cal-chip">
                      <Flame size={13} />
                      <strong>{item.calories}</strong> kcal
                    </span>
                  </td>
                  <td className="log-carbs-col">
                    <span className="carb-chip">
                      <Wheat size={13} />
                      {item.carbohydrates}g
                    </span>
                  </td>
                  <td className="log-protein-col">
                    <span className="protein-chip">
                      <Beef size={13} />
                      {item.protein}g
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      className="btn-delete-row"
                      onClick={() => handleDelete(item._id, item.foodName)}
                      title={`Remove ${item.foodName}`}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="log-table-footer">
                <td colSpan="4">
                  <strong>Total Daily Intake:</strong>
                </td>
                <td>
                  <strong className="text-flame">{summary?.totalCalories || 0} kcal</strong>
                </td>
                <td>
                  <strong className="text-carbs">{summary?.totalCarbs || 0}g</strong>
                </td>
                <td>
                  <strong className="text-protein">{summary?.totalProtein || 0}g</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
