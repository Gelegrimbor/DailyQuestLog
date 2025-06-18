import { Link } from "react-router-dom";
import "../styles/app.css"; // Or your own CSS file

export default function Home() {
  return (
    <div className="home-container">
      <h1>DailyQuestLog</h1>
      <p>Gamify your daily tasks. Earn XP. Defeat procrastination.</p>

      <div className="cta-buttons">
        <Link to="/signup">
          <button className="btn">Get Started</button>
        </Link>
        <Link to="/login">
          <button className="btn secondary">Login</button>
        </Link>
      </div>
    </div>
  );
}
