import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { SlippageOption } from '../types/token';

interface SlippageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: SlippageOption;
  customSlippage: string;
  onSelectSlippage: (opt: SlippageOption) => void;
  onCustomSlippageChange: (val: string) => void;
  deadlineMinutes: number;
  onDeadlineChange: (val: number) => void;
}

export const SlippageSettingsModal: React.FC<SlippageSettingsModalProps> = ({
  isOpen,
  onClose,
  slippage,
  customSlippage,
  onSelectSlippage,
  onCustomSlippageChange,
  deadlineMinutes,
  onDeadlineChange,
}) => {
  const [localCustom, setLocalCustom] = useState(customSlippage);

  if (!isOpen) return null;

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setLocalCustom(val);
      onCustomSlippageChange(val);
      onSelectSlippage('custom');
    }
  };

  const parsedCustom = parseFloat(localCustom);
  const isHighSlippage = slippage === 'custom' && parsedCustom > 5;
  const isTooLowSlippage = slippage === 'custom' && parsedCustom < 0.05 && parsedCustom > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Transaction Settings</span>
          <button className="icon-button" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-section">
          <div>
            <div className="settings-label">
              <span>Slippage Tolerance</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Current: {slippage === 'custom' ? `${localCustom || '0'}%` : `${slippage}%`}
              </span>
            </div>

            <div className="slippage-btn-group">
              <button
                type="button"
                className={`slippage-btn ${slippage === 0.1 ? 'active' : ''}`}
                onClick={() => onSelectSlippage(0.1)}
              >
                0.1%
              </button>
              <button
                type="button"
                className={`slippage-btn ${slippage === 0.5 ? 'active' : ''}`}
                onClick={() => onSelectSlippage(0.5)}
              >
                0.5%
              </button>
              <button
                type="button"
                className={`slippage-btn ${slippage === 1.0 ? 'active' : ''}`}
                onClick={() => onSelectSlippage(1.0)}
              >
                1.0%
              </button>
              <div className={`custom-slippage-input-box ${slippage === 'custom' ? 'active' : ''}`}>
                <input
                  type="text"
                  placeholder="Custom"
                  className="custom-slippage-input"
                  value={localCustom}
                  onChange={handleCustomChange}
                  onFocus={() => onSelectSlippage('custom')}
                />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '2px' }}>%</span>
              </div>
            </div>

            {isHighSlippage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', color: 'var(--accent-amber)', fontSize: '0.75rem' }}>
                <AlertCircle size={14} />
                <span>High slippage increases the risk of frontrunning.</span>
              </div>
            )}

            {isTooLowSlippage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', color: 'var(--accent-rose)', fontSize: '0.75rem' }}>
                <AlertCircle size={14} />
                <span>Low slippage may cause transactions to fail.</span>
              </div>
            )}
          </div>

          <div>
            <div className="settings-label">
              <span>Transaction Deadline</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{deadlineMinutes} min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min={1}
                max={120}
                value={deadlineMinutes}
                onChange={(e) => onDeadlineChange(Math.max(1, parseInt(e.target.value) || 20))}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '0.55rem 0.85rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  width: '80px',
                  outline: 'none',
                }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
