import React from 'react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="hero" aria-label="HH Goa 2026 Builder Identity System">
      <p className="hero-eyebrow">⚡ Builder Identity Generator</p>
      <h1 className="hero-title">
        HH <span>GOA</span><br />2026
      </h1>
      <p className="hero-subtitle">
        Create your branded profile frame or builder ID card for Hacker House Goa 2026
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span className="hero-event-badge">
          🌊 &nbsp; 28–31 OCT · GOA, INDIA &nbsp; 🏖️
        </span>
        <button
          className="btn btn-primary btn-lg"
          onClick={onStart}
          aria-label="Start creating your builder identity"
          style={{ marginTop: 8 }}
        >
          Create Your Builder Identity →
        </button>
      </div>
      <div className="hero-divider" />
    </section>
  );
};

export default Hero;
