import React from 'react';
import {
  Activity,
  PlusCircle,
  QrCode,
  BarChart3,
  Calendar,
  Target,
  Sparkles
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenScannerModal,
  onOpenGoalModal,
  selectedDate,
  dailyGoal
}) {
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="header-wrapper">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Activity size={26} className="text-white" />
          </div>
          <div className="brand-titles">
            <h1 className="brand-name">NutriTrack</h1>
            <span className="brand-tagline">Diet & Nutrition Tracker</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('add');
              if (onOpenAddModal) onOpenAddModal();
            }}
          >
            <PlusCircle size={18} />
            <span>Add Food</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('scanner');
              if (onOpenScannerModal) onOpenScannerModal();
            }}
          >
            <QrCode size={18} />
            <span>Barcode Scanner</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={18} />
            <span>Charts</span>
          </button>

          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Calendar size={18} />
            <span>History</span>
          </button>
        </nav>

        {/* Right Info and Actions */}
        <div className="header-actions">
          <div className="today-badge">
            <Calendar size={14} />
            <span>{formattedToday}</span>
          </div>

          <button
            className="goal-badge-btn"
            onClick={onOpenGoalModal}
            title="Click to set daily calorie goal"
          >
            <Target size={16} />
            <span>Goal: {dailyGoal || 2000} kcal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
