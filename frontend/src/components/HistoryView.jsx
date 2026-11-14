import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  Wheat,
  Beef,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  Utensils
} from 'lucide-react';
import { getHistoryLogs } from '../services/api';

export default function HistoryView({ showToast }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});
  const [rangePreset, setRangePreset] = useState('30'); // '7', '30', '90', '365'

  // Calculate 1 year ago limit string
  const getMinDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 365);
    return d.toISOString().split('T')[0];
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(getTodayDateString());

  const fetchHistory = async (start, end) => {
    setLoading(true);
    try {
      const res = await getHistoryLogs(start, end);
      if (res.success) {
        setHistory(res.history || []);
        // Auto-expand first 2 days
        if (res.history?.length > 0) {
          const initialExpanded = {};
          res.history.slice(0, 2).forEach((d) => {
            initialExpanded[d.date] = true;
          });
          setExpandedDates(initialExpanded);
        }
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error Fetching History',
        message: err.response?.data?.message || err.message || 'Could not load history logs.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(startDate, endDate);
  }, [startDate, endDate]);

  const handlePresetChange = (days) => {
    setRangePreset(days);
    const d = new Date();
    d.setDate(d.getDate() - Number(days));
    const newStart = d.toISOString().split('T')[0];
    const newEnd = getTodayDateString();
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const toggleExpand = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Metrics
  const totalDays = history.length;
  const totalCaloriesTracked = history.reduce((sum, d) => sum + d.totalCalories, 0);
  const avgCalories = totalDays > 0 ? Math.round(totalCaloriesTracked / totalDays) : 0;
  const daysExceeded = history.filter((d) => d.isExceeded).length;
  const daysMet = totalDays - daysExceeded;

  const formatDisplayDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="history-view-container">
      {/* Top Banner / Filter Row */}
      <div className="history-header-card">
        <div className="history-title-wrap">
          <Calendar size={24} className="text-emerald-600" />
          <div>
            <h2 className="history-main-title">Food Log History & Archive</h2>
            <p className="history-sub-title">
              View and audit all food entries for up to 1 full year (365 days)
            </p>
          </div>
        </div>

        {/* Date Filters & Presets */}
        <div className="history-filters-wrap">
          <div className="preset-chips-row">
            <button
              className={`preset-chip ${rangePreset === '7' ? 'active' : ''}`}
              onClick={() => handlePresetChange('7')}
            >
              Past 7 Days
            </button>
            <button
              className={`preset-chip ${rangePreset === '30' ? 'active' : ''}`}
              onClick={() => handlePresetChange('30')}
            >
              Past 30 Days
            </button>
            <button
              className={`preset-chip ${rangePreset === '90' ? 'active' : ''}`}
              onClick={() => handlePresetChange('90')}
            >
              Past 90 Days
            </button>
            <button
              className={`preset-chip ${rangePreset === '365' ? 'active' : ''}`}
              onClick={() => handlePresetChange('365')}
            >
              1 Year Archive (365d)
            </button>
          </div>

          <div className="custom-range-row">
            <div className="range-input-item">
              <label>From:</label>
              <input
                type="date"
                className="date-input"
                min={getMinDateString()}
                max={endDate}
                value={startDate}
                onChange={(e) => {
                  setRangePreset('custom');
                  setStartDate(e.target.value);
                }}
              />
            </div>
            <div className="range-input-item">
              <label>To:</label>
              <input
                type="date"
                className="date-input"
                min={startDate}
                max={getTodayDateString()}
                value={endDate}
                onChange={(e) => {
                  setRangePreset('custom');
                  setEndDate(e.target.value);
                }}
              />
            </div>
            <button
              className="btn btn-secondary btn-icon-only"
              onClick={() => fetchHistory(startDate, endDate)}
              title="Refresh History"
            >
              <RefreshCw className={loading ? 'spin' : ''} size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="history-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Days Tracked</span>
          <span className="metric-value text-slate-800">{totalDays}</span>
          <span className="metric-hint">in selected window</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Average Daily Intake</span>
          <span className="metric-value text-flame">{avgCalories} <small>kcal</small></span>
          <span className="metric-hint">calories / active day</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Days Goal Met</span>
          <span className="metric-value text-emerald-600">{daysMet}</span>
          <span className="metric-hint">within calorie limit</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Days Exceeded</span>
          <span className="metric-value text-rose-600">{daysExceeded}</span>
          <span className="metric-hint">over daily target</span>
        </div>
      </div>

      {/* List of Days */}
      {loading ? (
        <div className="history-loading-box">
          <RefreshCw className="spin" size={28} />
          <p>Loading historical food logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-history-box">
          <Calendar size={42} className="text-muted" />
          <h3>No food logs recorded in this period</h3>
          <p>Select another date range or use the Add Food modal to start logging.</p>
        </div>
      ) : (
        <div className="history-days-list">
          {history.map((day) => {
            const isExpanded = !!expandedDates[day.date];
            return (
              <div
                key={day.date}
                className={`history-day-card ${day.isExceeded ? 'day-exceeded-border' : ''}`}
              >
                {/* Day Header Row */}
                <div
                  className="history-day-header"
                  onClick={() => toggleExpand(day.date)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="day-left-meta">
                    <span className="day-date-title">{formatDisplayDate(day.date)}</span>
                    <span className="day-items-badge">
                      <Utensils size={13} />
                      {day.itemCount} {day.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    {day.isExceeded ? (
                      <span className="day-status-pill pill-exceeded">
                        <AlertTriangle size={13} />
                        Over by {day.exceededBy} kcal
                      </span>
                    ) : (
                      <span className="day-status-pill pill-within">
                        <CheckCircle size={13} />
                        Goal Met ({day.calorieGoal} kcal)
                      </span>
                    )}
                  </div>

                  <div className="day-right-stats">
                    <div className="day-macro-stat">
                      <Flame size={15} className="text-amber-500" />
                      <strong>{day.totalCalories}</strong> kcal
                    </div>
                    <div className="day-macro-stat">
                      <Wheat size={15} className="text-blue-500" />
                      <strong>{day.totalCarbs}g</strong> carbs
                    </div>
                    <div className="day-macro-stat">
                      <Beef size={15} className="text-emerald-500" />
                      <strong>{day.totalProtein}g</strong> protein
                    </div>

                    <button
                      className="btn-toggle-expand"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Food Items List */}
                {isExpanded && (
                  <div className="history-day-items-pane">
                    <table className="history-items-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Meal</th>
                          <th>Food Item</th>
                          <th>Portion</th>
                          <th>Calories</th>
                          <th>Carbs</th>
                          <th>Protein</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.items.map((item) => (
                          <tr key={item._id}>
                            <td className="text-muted text-sm">
                              <span className="flex items-center gap-1">
                                <Clock size={13} />
                                {formatTimestamp(item.timestamp)}
                              </span>
                            </td>
                            <td>
                              <span className="history-meal-pill">{item.mealType || 'Snack'}</span>
                            </td>
                            <td>
                              <strong>{item.foodName}</strong>
                              {item.barcode && (
                                <span className="history-barcode-tag">[{item.barcode}]</span>
                              )}
                            </td>
                            <td>{item.quantity}</td>
                            <td>
                              <strong>{item.calories}</strong> kcal
                            </td>
                            <td>{item.carbohydrates}g</td>
                            <td>{item.protein}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
