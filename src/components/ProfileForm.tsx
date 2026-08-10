import React, { useState } from 'react';
import type { ProfileData } from '../types';
import { BUILDER_TITLES } from '../types';

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onChange }) => {
  const [randomizing, setRandomizing] = useState(false);

  const update = (key: keyof ProfileData, value: string) => {
    onChange({ ...profile, [key]: value });
  };

  const randomizeTitle = () => {
    setRandomizing(true);
    const current = profile.builderTitle;
    const choices = BUILDER_TITLES.filter((t) => t !== current);
    const next = choices[Math.floor(Math.random() * choices.length)];
    onChange({ ...profile, builderTitle: next });
    setTimeout(() => setRandomizing(false), 300);
  };

  return (
    <div className="section-card">
      <p className="section-number">03 · YOUR DETAILS</p>
      <h2 className="section-title">Builder Profile</h2>

      <div className="form-grid">
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="field-name">Name</label>
          <input
            id="field-name"
            className="form-input"
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your full name"
            maxLength={40}
            aria-label="Your name"
            autoComplete="name"
          />
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label" htmlFor="field-age">Age</label>
          <input
            id="field-age"
            className="form-input"
            type="number"
            value={profile.age}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || (parseInt(v) >= 1 && parseInt(v) <= 120)) update('age', v);
            }}
            placeholder="21"
            min="1"
            max="120"
            aria-label="Your age"
          />
        </div>

        {/* Role / Stack */}
        <div className="form-group full">
          <label className="form-label" htmlFor="field-role">Stack / Role</label>
          <input
            id="field-role"
            className="form-input"
            type="text"
            value={profile.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="Full Stack Development"
            maxLength={60}
            aria-label="Your stack or role"
          />
        </div>

        {/* Currently Shipping */}
        <div className="form-group full">
          <label className="form-label" htmlFor="field-shipping">Currently Shipping</label>
          <textarea
            id="field-shipping"
            className="form-textarea"
            value={profile.currentlyShipping}
            onChange={(e) => update('currentlyShipping', e.target.value)}
            placeholder="AI code review tool"
            maxLength={120}
            rows={2}
            aria-label="What you are currently building or shipping"
          />
        </div>

        {/* Builder Title */}
        <div className="form-group full">
          <label className="form-label" htmlFor="field-title">Builder Title</label>
          <div className="title-input-wrapper">
            <input
              id="field-title"
              className="form-input"
              type="text"
              value={profile.builderTitle}
              onChange={(e) => update('builderTitle', e.target.value)}
              placeholder="Jungle Refactoring Pioneer"
              maxLength={50}
              aria-label="Your builder title"
            />
            <button
              className={`btn btn-secondary btn-sm${randomizing ? ' randomizing' : ''}`}
              onClick={randomizeTitle}
              title="Generate a random builder title"
              aria-label="Randomize builder title"
              style={{ flexShrink: 0 }}
            >
              🎲 Random
            </button>
          </div>
        </div>

        {/* GitHub */}
        <div className="form-group full">
          <label className="form-label" htmlFor="field-github">GitHub Username</label>
          <div className="github-input-wrapper">
            <span className="github-prefix" aria-hidden="true">github.com/</span>
            <input
              id="field-github"
              className="github-input"
              type="text"
              value={profile.githubUsername}
              onChange={(e) => {
                // Strip any github.com/ prefix the user might paste
                let val = e.target.value.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').trim();
                // Only alphanumeric and hyphens
                val = val.replace(/[^a-zA-Z0-9-]/g, '');
                update('githubUsername', val);
              }}
              placeholder="your-username"
              maxLength={39}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-label="GitHub username (generates QR code)"
            />
          </div>
          {profile.githubUsername && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-secondary)',
                marginTop: 4,
              }}
              aria-live="polite"
            >
              QR → github.com/{profile.githubUsername}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
