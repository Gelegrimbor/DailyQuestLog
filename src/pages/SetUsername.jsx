import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const HEROES = [
  { name: "Knight", img: "/images/hero1.gif" },
  { name: "Rogue", img: "/images/hero2.gif" },
  { name: "Mage", img: "/images/hero3.gif" },
  { name: "Paladin", img: "/images/hero4.gif" },
  { name: "Hunter", img: "/images/hero5.gif" },
];

export default function SetUsername() {
  const [username, setUsername] = useState("");
  const [selectedHero, setSelectedHero] = useState(0); // index of HEROES
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        username: username.trim(),
        email: user.email,
        createdAt: serverTimestamp(),
        xp: 0,
        heroImage: HEROES[selectedHero].img, // Save hero image path
        heroName: HEROES[selectedHero].name,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving username:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Optional: Arrow navigation for keyboard support
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setSelectedHero((prev) => (prev === 0 ? HEROES.length - 1 : prev - 1));
    } else if (e.key === "ArrowRight") {
      setSelectedHero((prev) => (prev === HEROES.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="form-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <h2>Set Your Username</h2>
      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="character-select-row">
          {HEROES.map((hero, i) => (
            <div
              key={hero.name}
              className={`character-option${selectedHero === i ? " selected" : ""}`}
              onClick={() => setSelectedHero(i)}
            >
              <img
                src={hero.img}
                alt={hero.name}
                className="character-gif"
                style={{
                  border: selectedHero === i ? "3px solid #ffce3d" : "2px solid transparent",
                  borderRadius: "16px",
                  background: "#222",
                  width: 90,
                  height: 90,
                  boxShadow: selectedHero === i ? "0 0 16px #ffce3d" : "none",
                  cursor: "pointer",
                }}
              />
              <div style={{
                color: selectedHero === i ? "#ffce3d" : "#ccc",
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 5,
              }}>
                {hero.name}
              </div>
            </div>
          ))}
        </div>

        <button type="submit">Continue</button>
        {error && <p className="error">{error}</p>}
      </form>
      <style>{`
        .character-select-row {
          display: flex;
          justify-content: center;
          gap: 1.2rem;
          margin: 16px 0 24px;
        }
        .character-option.selected { transform: scale(1.12); }
        .character-option { transition: transform 0.18s; }
      `}</style>
    </div>
  );
}
