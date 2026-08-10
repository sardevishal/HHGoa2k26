import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { CropSettings, GeneratorMode } from '../types';
import { computeCropTransform, roundedRect } from '../utils/cropUtils';

interface ImageCropEditorProps {
  image: HTMLImageElement | null;
  crop: CropSettings;
  onChange: (crop: CropSettings) => void;
  mode: GeneratorMode;
}

// Viewport sizes for crop preview (display sizes, not export sizes)
const VIEWPORTS: Record<GeneratorMode, { w: number; h: number }> = {
  PFP_FRAME: { w: 280, h: 280 },
  BUILDER_CARD: { w: 280, h: 190 },
};

const ImageCropEditor: React.FC<ImageCropEditorProps> = ({
  image,
  crop,
  onChange,
  mode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startH: number; startV: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const viewport = VIEWPORTS[mode];

  // Draw crop preview on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = viewport;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#08160c';
    ctx.fillRect(0, 0, w, h);

    if (!image) {
      ctx.fillStyle = '#2a5030';
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a photo', w / 2, h / 2 - 8);
      ctx.fillStyle = '#3e5e42';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('to see preview', w / 2, h / 2 + 10);
      return;
    }

    const { sx, sy, sw, sh } = computeCropTransform(
      image.naturalWidth,
      image.naturalHeight,
      w,
      h,
      crop
    );

    ctx.save();
    roundedRect(ctx, 0, 0, w, h, 8);
    ctx.clip();
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();

    // Overlay: subtle vignette
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.25)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = 'rgba(212,160,23,0.5)';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 0.75, 0.75, w - 1.5, h - 1.5, 8);
    ctx.stroke();

    // Crosshair guides
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [image, crop, viewport]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Drag to reposition
  const getRelativePos = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getRelativePos(e);
    dragRef.current = {
      startX: pos.x,
      startY: pos.y,
      startH: crop.horizontal,
      startV: crop.vertical,
    };
    setIsDragging(true);
  }, [crop]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = ((clientX - rect.left) / rect.width) * 100 - dragRef.current.startX;
    const deltaY = ((clientY - rect.top) / rect.height) * 100 - dragRef.current.startY;

    // Dragging RIGHT on canvas = moving viewport RIGHT = increasing horizontal (showing more left of image)
    // Actually: drag right = want to see left of image = decrease horizontal offset
    const newH = Math.max(0, Math.min(100, dragRef.current.startH - deltaX * 1.5));
    const newV = Math.max(0, Math.min(100, dragRef.current.startV - deltaY * 1.5));

    onChange({ ...crop, horizontal: newH, vertical: newV });
  }, [crop, onChange]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Presets
  const applyPreset = (h: number, v: number, z?: number) => {
    onChange({ ...crop, horizontal: h, vertical: v, zoom: z ?? crop.zoom });
  };

  const handleAutoCenter = () => {
    // Sensible portrait framing — upper 35% vertically, centered horizontally
    onChange({ ...crop, horizontal: 50, vertical: 28, zoom: Math.max(crop.zoom, 1.2) });
  };

  const handleReset = () => {
    onChange({ zoom: 1.0, horizontal: 50, vertical: 35 });
  };

  return (
    <div className="section-card">
      <p className="section-number">02 · POSITION IMAGE</p>
      <h2 className="section-title">Crop & Position</h2>

      {/* Crop viewport */}
      <div className="crop-viewport-container">
        <div
          className="crop-viewport-wrapper"
          style={{ width: viewport.w, height: viewport.h, cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          aria-label="Drag to reposition image"
        >
          <canvas
            ref={canvasRef}
            className="crop-canvas"
            width={viewport.w}
            height={viewport.h}
            style={{ display: 'block' }}
          />
          <span className="crop-overlay-label">
            {mode === 'PFP_FRAME' ? 'Square · PFP Frame' : 'Portrait · Builder Card'}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="crop-presets">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            alignSelf: 'center',
            marginRight: 4,
          }}
        >
          PRESETS:
        </span>
        <button className="preset-btn" onClick={() => applyPreset(50, 5, 1.3)} aria-label="Upper Top preset">
          ↑ Upper Top
        </button>
        <button className="preset-btn" onClick={() => applyPreset(50, 22, 1.1)} aria-label="Upper Body preset">
          ↕ Upper Body
        </button>
        <button className="preset-btn" onClick={() => applyPreset(50, 50, 1.0)} aria-label="Center preset">
          ⊕ Center
        </button>
        <button className="preset-btn face-btn" onClick={handleAutoCenter} aria-label="Auto-center face">
          👤 Auto-Center
        </button>
      </div>

      {/* Sliders */}
      <div className="crop-controls">
        <SliderControl
          label="Zoom"
          value={crop.zoom}
          min={1}
          max={3}
          step={0.01}
          displayValue={`${crop.zoom.toFixed(2)}×`}
          onChange={(v) => onChange({ ...crop, zoom: v })}
        />
        <SliderControl
          label="Vertical Position"
          value={crop.vertical}
          min={0}
          max={100}
          step={0.5}
          displayValue={`${Math.round(crop.vertical)}%`}
          onChange={(v) => onChange({ ...crop, vertical: v })}
        />
        <SliderControl
          label="Horizontal Position"
          value={crop.horizontal}
          min={0}
          max={100}
          step={0.5}
          displayValue={`${Math.round(crop.horizontal)}%`}
          onChange={(v) => onChange({ ...crop, horizontal: v })}
        />
      </div>

      {/* Reset */}
      <div className="crop-reset-row" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleReset} aria-label="Reset crop to defaults">
          ↺ Reset Crop
        </button>
      </div>
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label, value, min, max, step, displayValue, onChange,
}) => {
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label" htmlFor={id}>{label}</label>
        <span className="slider-value" aria-live="polite">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={`${label}: ${displayValue}`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
};

export default ImageCropEditor;
