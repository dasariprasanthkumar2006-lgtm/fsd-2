import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Package
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode } from '../services/api';

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onProductFound,
  showToast
}) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' or 'manual'
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [lookupMessage, setLookupMessage] = useState('');

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'barcode-reader-container';

  // Sample Barcodes for 1-click testing
  const sampleBarcodes = [
    { label: 'Nutella (Ferrero)', code: '3017620422003' },
    { label: 'Coca-Cola (330ml)', code: '5449000000996' },
    { label: 'Quaker Oats', code: '028400064082' },
    { label: 'Chobani Greek Yogurt', code: '011110038548' },
    { label: 'Whey Protein Powder', code: '074570084004' },
    { label: 'Maggi Noodles', code: '8901030383701' },
    { label: 'Oreo Cookies', code: '7622210449283' }
  ];

  // Stop camera when modal closes or switching modes
  useEffect(() => {
    if (!isOpen) {
      stopCameraScanner();
      setFoundProduct(null);
      setLookupMessage('');
      setManualCode('');
      setCameraError('');
    }
  }, [isOpen]);

  const startCameraScanner = async () => {
    setCameraError('');
    setScanning(true);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const qrCodeSuccessCallback = async (decodedText) => {
        console.log('Barcode detected:', decodedText);
        // Stop scanning upon detection
        stopCameraScanner();
        await handleBarcodeLookup(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 180 },
        aspectRatio: 1.333334
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // ignore common scan frame misses
        }
      );
    } catch (err) {
      console.warn('Camera scan initialization failed:', err);
      setCameraError(
        'Unable to access camera or camera permission denied. You can switch to Manual Barcode Input below.'
      );
      setScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.log('Error stopping scanner:', err);
    }
    setScanning(false);
  };

  const handleBarcodeLookup = async (codeToLookup) => {
    const code = (codeToLookup || manualCode).trim();
    if (!code) {
      setLookupMessage('Please enter or scan a barcode.');
      return;
    }

    setLoading(true);
    setLookupMessage('');
    setFoundProduct(null);

    try {
      const res = await lookupBarcode(code);
      if (res.success && res.data) {
        setFoundProduct(res.data);
        setLookupMessage(`Found product from ${res.source === 'local_database' ? 'Database' : 'OpenFoodFacts'}!`);
        showToast({
          type: 'success',
          title: 'Product Found',
          message: `${res.data.name} (${res.data.calories} kcal) retrieved.`
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Barcode not found. You can enter details manually.';
      setLookupMessage(msg);
      showToast({
        type: 'warning',
        title: 'Barcode Not Found',
        message: msg
      });
      // Allow proceeding with the barcode number pre-filled
      setFoundProduct({
        name: `Packaged Item (${code})`,
        barcode: code,
        calories: '',
        carbohydrates: '',
        protein: '',
        quantity: '1 package'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = () => {
    if (foundProduct) {
      onProductFound(foundProduct);
      stopCameraScanner();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card scanner-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-badge icon-scanner">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="modal-title">Barcode Scanner</h2>
              <p className="modal-subtitle">Scan packaged foods for instant nutrition facts</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="scanner-tabs">
          <button
            className={`scanner-tab-btn ${activeMode === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveMode('camera');
              setCameraError('');
            }}
          >
            <Camera size={18} />
            <span>Live Camera Scanner</span>
          </button>
          <button
            className={`scanner-tab-btn ${activeMode === 'manual' ? 'active' : ''}`}
            onClick={() => {
              stopCameraScanner();
              setActiveMode('manual');
            }}
          >
            <Search size={18} />
            <span>Manual Barcode Input</span>
          </button>
        </div>

        {/* Camera Scanner View */}
        {activeMode === 'camera' && (
          <div className="scanner-camera-pane">
            <div id={scannerContainerId} className="camera-view-window">
              {!scanning && (
                <div className="camera-placeholder">
                  <Camera size={48} className="text-muted" />
                  <p className="mt-2 text-sm text-secondary">
                    Point your device camera at any food product barcode.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={startCameraScanner}
                  >
                    <Camera size={18} />
                    <span>Open Camera & Scan</span>
                  </button>
                </div>
              )}
            </div>

            {scanning && (
              <div className="scanner-controls-row">
                <span className="live-scanning-indicator">
                  <span className="pulsing-dot"></span> Scanning live camera feed...
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={stopCameraScanner}
                >
                  Stop Camera
                </button>
              </div>
            )}

            {cameraError && (
              <div className="modal-warning-box">
                <AlertCircle size={18} className="text-amber-500" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Manual Input View */}
        {activeMode === 'manual' && (
          <div className="manual-barcode-pane">
            <label className="form-label">Enter Barcode / EAN / UPC Number</label>
            <div className="barcode-search-box">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 3017620422003, 5449000000996..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeLookup()}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleBarcodeLookup()}
                disabled={loading}
              >
                {loading ? <RefreshCw className="spin" size={18} /> : <Search size={18} />}
                <span>Lookup</span>
              </button>
            </div>

            {/* Quick Sample Barcodes */}
            <div className="sample-barcodes-section">
              <span className="sample-title">Or click a sample packaged food barcode:</span>
              <div className="sample-chips-grid">
                {sampleBarcodes.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="sample-chip"
                    onClick={() => {
                      setManualCode(item.code);
                      handleBarcodeLookup(item.code);
                    }}
                  >
                    <Package size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Found Product Result Card */}
        {foundProduct && (
          <div className="found-product-card">
            <div className="found-product-header">
              <CheckCircle size={22} className="text-emerald-500" />
              <div>
                <h4 className="found-product-title">{foundProduct.name}</h4>
                <span className="found-product-brand">
                  {foundProduct.brand ? `${foundProduct.brand} • ` : ''}
                  Barcode: {foundProduct.barcode}
                </span>
              </div>
            </div>

            <div className="found-macros-row">
              <div className="macro-badge-box">
                <span className="macro-badge-label">Calories</span>
                <span className="macro-badge-val text-amber-600">{foundProduct.calories || 0} kcal</span>
              </div>
              <div className="macro-badge-box">
                <span className="macro-badge-label">Carbs</span>
                <span className="macro-badge-val text-blue-600">{foundProduct.carbohydrates || 0}g</span>
              </div>
              <div className="macro-badge-box">
                <span className="macro-badge-label">Protein</span>
                <span className="macro-badge-val text-emerald-600">{foundProduct.protein || 0}g</span>
              </div>
              <div className="macro-badge-box">
                <span className="macro-badge-label">Serving</span>
                <span className="macro-badge-val text-slate-700">{foundProduct.quantity || '1 serving'}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full mt-3"
              onClick={handleSelectProduct}
            >
              <Sparkles size={18} />
              <span>Use This Food in Log</span>
            </button>
          </div>
        )}

        {lookupMessage && !foundProduct && (
          <div className="lookup-info-message">
            <span>{lookupMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
