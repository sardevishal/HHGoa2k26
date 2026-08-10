import React, { useRef, useState, useCallback } from 'react';

interface PhotoUploaderProps {
  image: HTMLImageElement | null;
  imageFile: File | null;
  onImageLoad: (img: HTMLImageElement, file: File) => void;
  onImageRemove: () => void;
}

const MAX_SIZE_MB = 20;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  image,
  imageFile,
  onImageLoad,
  onImageRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported format. Please upload JPG, PNG, or WEBP.');
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setThumbUrl(url);
        onImageLoad(img, file);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError('Could not load image. Please try a different file.');
      };
      img.src = url;
    },
    [onImageLoad]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setThumbUrl(null);
    setError(null);
    onImageRemove();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (image && imageFile) {
    return (
      <div className="section-card">
        <p className="section-number">01 · UPLOAD PHOTO</p>
        <h2 className="section-title">Profile Photo</h2>
        <div className="photo-preview-row">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              className="photo-thumb"
              alt="Profile photo thumbnail"
            />
          ) : (
            <div className="photo-thumb-placeholder" aria-hidden="true" />
          )}
          <div className="photo-info">
            <div className="photo-name">{imageFile.name}</div>
            <div className="photo-size">{formatSize(imageFile.size)}</div>
          </div>
          <div className="photo-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => replaceInputRef.current?.click()}
              aria-label="Replace photo"
            >
              ↺ Change
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        </div>
        <input
          ref={replaceInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label="Replace photo"
        />
        {error && <div className="error-msg" role="alert">{error}</div>}
      </div>
    );
  }

  return (
    <div className="section-card">
      <p className="section-number">01 · UPLOAD PHOTO</p>
      <h2 className="section-title">Profile Photo</h2>

      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload profile photo — click or drag and drop"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <span className="upload-icon" aria-hidden="true">📸</span>
        <div className="upload-text">
          {dragOver ? 'Drop your photo here' : 'Click to upload or drag & drop'}
        </div>
        <div className="upload-hint">JPG · JPEG · PNG · WEBP · max {MAX_SIZE_MB}MB</div>
        <input
          ref={fileInputRef}
          type="file"
          className="upload-input"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          aria-label="File input for profile photo"
        />
      </div>

      {error && <div className="error-msg" role="alert">{error}</div>}
    </div>
  );
};

export default PhotoUploader;
