import { useNavigate } from "react-router-dom";
import "../styles/app.css"; // your shared styles

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">🎯 DailyQuestLog</h1>
      <p className="home-subtitle">Embark on your daily journey. Earn XP. Defeat procrastination!</p>

      <div className="home-buttons">
        <button className="rpg-button" onClick={() => navigate("/signup")}>
          🎮 Play Now
        </button>
        <button className="rpg-button secondary" onClick={() => navigate("/login")}>
          🔑 Login
        </button>
      </div>

      {/* Optional future feature */}
      {/* <audio controls loop src="/bgm.mp3" /> */}
    </div>
  );
}
