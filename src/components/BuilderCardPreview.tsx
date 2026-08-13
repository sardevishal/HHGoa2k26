import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { ProfileData, CropSettings } from '../types';
import { renderBuilderCard } from '../utils/canvasRenderer';

interface BuilderCardPreviewProps {
  image: HTMLImageElement | null;
  profile: ProfileData;
  crop: CropSettings;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

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

        // Set canvas resolution to match the offscreen canvas (1080×1350)
        // The display size is controlled purely by CSS (max-width: 100%, height: auto)
        canvas.width = offscreen.width;
        canvas.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);

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
    <div style={{ position: 'relative', display: 'block', width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          borderRadius: 10,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          opacity: rendering ? 0.7 : 1,
          transition: 'opacity 0.15s',
          aspectRatio: '1080 / 1350',
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
