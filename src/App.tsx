import React, { useState, useCallback, useRef } from 'react';
import './index.css';

import type { GeneratorMode, CropSettings, ProfileData } from './types';
import { DEFAULT_CROP, DEFAULT_PROFILE } from './types';
import { buildShareText, shareToX, downloadCanvas } from './utils/shareUtils';

import Hero from './components/Hero';
import ModeSelector from './components/ModeSelector';
import PhotoUploader from './components/PhotoUploader';
import ImageCropEditor from './components/ImageCropEditor';
import ProfileForm from './components/ProfileForm';
import BuilderCardPreview from './components/BuilderCardPreview';
import PfpFramePreview from './components/PfpFramePreview';
import ShareActions from './components/ShareActions';
import Footer from './components/Footer';

const App: React.FC = () => {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<GeneratorMode>('BUILDER_CARD');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);

  // The last fully-rendered export canvas (high resolution, updated by preview components)
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null);

  const mainSectionRef = useRef<HTMLDivElement>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleImageLoad = useCallback((img: HTMLImageElement, file: File) => {
    setImage(img);
    setImageFile(file);
    // Use sensible portrait-framing default on new upload
    setCrop({ zoom: 1.2, horizontal: 50, vertical: 28 });
  }, []);

  const handleImageRemove = useCallback(() => {
    setImage(null);
    setImageFile(null);
    setCrop(DEFAULT_CROP);
  }, []);

  const handleModeChange = useCallback((newMode: GeneratorMode) => {
    setMode(newMode);
    // Preserve all other state when switching modes
  }, []);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setExportCanvas(canvas);
  }, []);

  const scrollToMain = () => {
    mainSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickDownload = () => {
    if (!exportCanvas) return;
    const safeName = (profile.name || 'builder').replace(/\s+/g, '-').toLowerCase();
    const filename =
      mode === 'BUILDER_CARD'
        ? `hh-goa-2026-builder-card-${safeName}.png`
        : `hh-goa-2026-pfp-frame-${safeName}.png`;
    downloadCanvas(exportCanvas, filename);
  };

  const handleQuickShare = () => {
    shareToX(buildShareText(profile, mode));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* Hero */}
      <Hero onStart={scrollToMain} />

      {/* Main content */}
      <div ref={mainSectionRef} className="main-grid">
        {/* ── Left: Controls ────────────────────────────────────────────────── */}
        <div className="controls-col">
          <ModeSelector mode={mode} onChange={handleModeChange} />
          <PhotoUploader
            image={image}
            imageFile={imageFile}
            onImageLoad={handleImageLoad}
            onImageRemove={handleImageRemove}
          />
          <ImageCropEditor
            image={image}
            crop={crop}
            onChange={setCrop}
            mode={mode}
          />
          <ProfileForm profile={profile} onChange={setProfile} />
          <ShareActions
            exportCanvas={exportCanvas}
            profile={profile}
            mode={mode}
          />
        </div>

        {/* ── Right: Live Preview ───────────────────────────────────────────── */}
        <div className="preview-col">
          <div className="preview-panel">
            <div className="preview-header">
              <span className="preview-label">Live Preview</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                }}
                aria-live="polite"
              >
                {mode === 'BUILDER_CARD' ? '1080 × 1350 px' : '1080 × 1080 px'}
              </span>
            </div>
            <div className="preview-canvas-wrap">
              {mode === 'BUILDER_CARD' ? (
                <BuilderCardPreview
                  image={image}
                  profile={profile}
                  crop={crop}
                  onCanvasReady={handleCanvasReady}
                />
              ) : (
                <PfpFramePreview
                  image={image}
                  profile={profile}
                  crop={crop}
                  onCanvasReady={handleCanvasReady}
                />
              )}
            </div>
          </div>

          {/* Quick action strip below preview */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Quick Actions
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={handleQuickDownload}
              disabled={!exportCanvas}
              aria-label="Download current card as PNG"
            >
              ⬇ Download {mode === 'BUILDER_CARD' ? 'Builder Card' : 'PFP Frame'}
            </button>
            <button
              className="btn btn-secondary btn-full"
              onClick={handleQuickShare}
              aria-label="Share to X"
            >
              𝕏 Share to X
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
