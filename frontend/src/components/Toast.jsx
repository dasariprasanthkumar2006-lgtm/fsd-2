import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = 'info', message, title } = toast;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="toast-icon text-emerald-500" size={22} />,
      bgClass: 'toast-success'
    },
    warning: {
      icon: <AlertTriangle className="toast-icon text-amber-500" size={22} />,
      bgClass: 'toast-warning'
    },
    error: {
      icon: <XCircle className="toast-icon text-rose-500" size={22} />,
      bgClass: 'toast-error'
    },
    info: {
      icon: <Info className="toast-icon text-blue-500" size={22} />,
      bgClass: 'toast-info'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`toast-container ${config.bgClass}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">{config.icon}</div>
        <div className="toast-text">
          {title && <h4 className="toast-title">{title}</h4>}
          <p className="toast-message">{message}</p>
        </div>
        <button
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
