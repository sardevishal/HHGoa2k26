import React from 'react';
import type { GeneratorMode } from '../types';

interface ModeSelectorProps {
  mode: GeneratorMode;
  onChange: (mode: GeneratorMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange }) => {
  return (
    <div className="section-card">
      <p className="section-number">00 · SELECT MODE</p>
      <h2 className="section-title">What are you creating?</h2>
      <div className="mode-selector" role="radiogroup" aria-label="Select creation mode">
        <button
          className={`mode-card${mode === 'PFP_FRAME' ? ' active' : ''}`}
          onClick={() => onChange('PFP_FRAME')}
          role="radio"
          aria-checked={mode === 'PFP_FRAME'}
          aria-label="PFP Frame — profile picture overlay"
        >
          <span className="mode-icon" aria-hidden="true">🖼️</span>
          <div className="mode-label">PFP Frame</div>
          <div className="mode-desc">Profile picture overlay — upload & customize for social platforms</div>
          <span className="mode-check" aria-hidden="true">✓</span>
        </button>

        <button
          className={`mode-card${mode === 'BUILDER_CARD' ? ' active' : ''}`}
          onClick={() => onChange('BUILDER_CARD')}
          role="radio"
          aria-checked={mode === 'BUILDER_CARD'}
          aria-label="Builder ID Card — event badge with your details"
        >
          <span className="mode-icon" aria-hidden="true">🪪</span>
          <div className="mode-label">Builder ID Card</div>
          <div className="mode-desc">Event badge with your name, role & GitHub QR code</div>
          <span className="mode-check" aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
