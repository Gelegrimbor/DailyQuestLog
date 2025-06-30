import { useNavigate } from 'react-router-dom';
import '../styles/app.css';
import React from 'react';
import questGif from '../assets/quest.gif';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="game-title">DailyQuestLog</h1>
        <p className="subtitle">Gamify Your Life</p>
        <p className="tagline">
          Turn boring real-life tasks into epic quests. Earn XP, Level Up, and stay productive like a true RPG hero.
        </p>

        <div className="gif-box">
          <img src={questGif} alt="Hero Character" className="hero-gif" />
        </div>

        {/* Single centered Play button */}
        <div className="button-row" style={{ justifyContent: "center" }}>
          <button onClick={() => navigate('/signup')} className="btn-primary">
            🎮 Play Now
          </button>
        </div>
      </div>

      {/* Feature Scroll Section */}
      <div className="features-section">
        <div className="feature-row">
          <video src="/assets/track.mp4" autoPlay loop muted className="feature-video"></video>
          <div className="feature-paragraph">
            <h2>Track Daily Quests</h2>
            <p>Set daily goals, complete them, and earn XP as you progress through real life missions.</p>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-paragraph">
            <h2>Level Up Like a Hero</h2>
            <p>Each completed quest brings you closer to leveling up. Gain motivation with every click.</p>
          </div>
          <video src="/assets/levelup.mp4" autoPlay loop muted className="feature-video"></video>
        </div>
      </div>

      <div className="footer-icons">
        <div className="icon-feature"><span>⏱️</span><p>Track Quests</p></div>
        <div className="icon-feature"><span>⬆️</span><p>Level Up</p></div>
        <div className="icon-feature"><span>🚀</span><p>Boost Productivity</p></div>
      </div>
    </div>
  );
}
