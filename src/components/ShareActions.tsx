import React, { useState, useCallback } from 'react';
import type { ProfileData, GeneratorMode } from '../types';
import {
  buildShareText,
  shareToX,
  shareToLinkedIn,
  copyToClipboard,
  nativeShare,
  downloadCanvas,
} from '../utils/shareUtils';

interface ShareActionsProps {
  exportCanvas: HTMLCanvasElement | null;
  profile: ProfileData;
  mode: GeneratorMode;
}

const ShareActions: React.FC<ShareActionsProps> = ({ exportCanvas, profile, mode }) => {
  const [copying, setCopying] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const shareText = buildShareText(profile, mode);

  const handleDownload = useCallback(async () => {
    if (!exportCanvas) {
      setDownloadError('Preview not ready yet. Please wait a moment and try again.');
      return;
    }
    setDownloadError(null);
    setDownloading(true);
    try {
      const safeName = (profile.name || 'builder').replace(/\s+/g, '-').toLowerCase();
      const filename =
        mode === 'BUILDER_CARD'
          ? `hh-goa-2026-builder-card-${safeName}.png`
          : `hh-goa-2026-pfp-frame-${safeName}.png`;
      downloadCanvas(exportCanvas, filename);
    } catch (err) {
      setDownloadError('Failed to generate download. Please try again.');
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  }, [exportCanvas, profile, mode]);

  const handleCopy = async () => {
    setCopying(true);
    const ok = await copyToClipboard(shareText);
    setCopying(false);
    if (ok) {
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const title = 'HH Goa 2026 — Builder Identity';
    const ok = await nativeShare(shareText, title);
    if (!ok) {
      // fallback: copy text
      handleCopy();
    }
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="share-actions">
      <div className="share-actions-title">04 · SAVE &amp; SHARE</div>

      {/* Download — primary action */}
      <div className="share-primary">
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={handleDownload}
          disabled={downloading || !exportCanvas}
          aria-label={`Download ${mode === 'BUILDER_CARD' ? 'Builder ID Card' : 'PFP Frame'} as PNG`}
        >
          {downloading ? (
            <>⏳ Generating…</>
          ) : (
            <>
              ⬇ Download PNG &nbsp;
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  opacity: 0.7,
                  fontWeight: 500,
                }}
              >
                {mode === 'BUILDER_CARD' ? '1080×1350' : '1080×1080'}
              </span>
            </>
          )}
        </button>
        {downloadError && (
          <div className="error-msg" role="alert">
            {downloadError}
          </div>
        )}
      </div>

      {/* Share buttons */}
      <div className="share-secondary">
        <button
          className="btn btn-secondary"
          onClick={() => shareToX(shareText)}
          aria-label="Share to X (Twitter)"
        >
          𝕏 Share to X
        </button>
        <button
          className="btn btn-secondary"
          onClick={shareToLinkedIn}
          aria-label="Share to LinkedIn"
        >
          in Share to LinkedIn
        </button>
      </div>

      <div className="share-tertiary">
        <button
          className="btn btn-ghost"
          onClick={handleCopy}
          disabled={copying}
          aria-label="Copy share text to clipboard"
        >
          {copyOk ? (
            <span className="copy-confirm">✓ Copied!</span>
          ) : (
            <>{copying ? '…' : '📋'} Copy Share Text</>
          )}
        </button>

        {supportsNativeShare ? (
          <button
            className="btn btn-ghost"
            onClick={handleNativeShare}
            aria-label="Share using device native share sheet"
          >
            ↗ Share
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={() => shareToX(shareText)}
            aria-label="Share to X"
          >
            ↗ Post on X
          </button>
        )}
      </div>

      {/* Share guidance */}
      <div
        style={{
          marginTop: 14,
          padding: '10px 14px',
          background: 'rgba(212,160,23,0.06)',
          border: '1px solid rgba(212,160,23,0.15)',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
        aria-label="Share instructions"
      >
        💡 Download your card first, then attach it when posting on X / LinkedIn for best results.
      </div>
    </div>
  );
};

export default ShareActions;
