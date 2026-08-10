import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { ProfileData, CropSettings } from '../types';
import { renderBuilderCard } from '../utils/canvasRenderer';

interface BuilderCardPreviewProps {
  image: HTMLImageElement | null;
  profile: ProfileData;
  crop: CropSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

// Display at 50% scale of the 1080×1350 output
const DISPLAY_W = 360;
const DISPLAY_H = 450;

const BuilderCardPreview: React.FC<BuilderCardPreviewProps> = ({
  image,
  profile,
  crop,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<number | null>(null);
  const [rendering, setRendering] = useState(false);

  const doRender = useCallback(async () => {
    if (renderRef.current) cancelAnimationFrame(renderRef.current);

    renderRef.current = requestAnimationFrame(async () => {
      setRendering(true);
      try {
        const offscreen = await renderBuilderCard(image, profile, crop);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = DISPLAY_W * dpr;
        canvas.height = DISPLAY_H * dpr;
        canvas.style.width = `${DISPLAY_W}px`;
        canvas.style.height = `${DISPLAY_H}px`;
        ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

        onCanvasReady(offscreen);
      } catch (err) {
        console.error('Builder card render error:', err);
      } finally {
        setRendering(false);
      }
    });
  }, [image, profile, crop, onCanvasReady]);

  useEffect(() => {
    doRender();
    return () => {
      if (renderRef.current) cancelAnimationFrame(renderRef.current);
    };
  }, [doRender]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={DISPLAY_W}
        height={DISPLAY_H}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          opacity: rendering ? 0.7 : 1,
          transition: 'opacity 0.15s',
        }}
        aria-label="Builder ID Card live preview"
        role="img"
      />
      {rendering && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'rgba(212,160,23,0.6)',
          }}
          aria-live="polite"
          aria-label="Rendering preview"
        >
          rendering…
        </div>
      )}
    </div>
  );
};

export default BuilderCardPreview;
