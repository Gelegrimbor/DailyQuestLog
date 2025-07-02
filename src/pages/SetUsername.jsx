import { useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const characterOptions = [
  { name: "Sion Chop", img: "/images/hero1.gif" },
  { name: "Knight", img: "/images/hero2.gif" },
  { name: "Lvl 7 Mastery", img: "/images/hero3.gif" },
  { name: "Jinx", img: "/images/hero4.gif" },
  { name: "Me", img: "/images/hero5.gif" },
];

export default function SetUsername() {
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!username.trim()) {
      setError("Please enter a username!");
      return;
    }
    setError("");
    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          username: username.trim(),
          character: characterOptions[selected],
        },
        { merge: true }
      );
      navigate("/dashboard");
    }
  };

  const next = () =>
    setSelected((prev) => (prev + 1) % characterOptions.length);
  const prev = () =>
    setSelected((prev) => (prev - 1 + characterOptions.length) % characterOptions.length);

  return (
    <div className="username-container">
      <div className="username-panel">
        {/* Title */}
        <div className="username-title">Set Your Username</div>
        {/* Username Input */}
        <input
          className="username-input"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
        />
        {/* Character Selection */}
        <div className="char-select-title">Choose your character</div>
        <div className="char-carousel">
          <button
            className="char-arrow"
            onClick={prev}
            aria-label="Previous Character"
            type="button"
          >
            &#8592;
          </button>
          <div className="char-image-box">
            <img
              src={characterOptions[selected].img}
              alt={characterOptions[selected].name}
              draggable={false}
              onError={e => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <button
            className="char-arrow"
            onClick={next}
            aria-label="Next Character"
            type="button"
          >
            &#8594;
          </button>
        </div>
        <div className="char-name">{characterOptions[selected].name}</div>
        <div className="char-dots">
          {characterOptions.map((_, i) => (
            <div
              key={i}
              className={`char-dot${i === selected ? " active" : ""}`}
              aria-label={characterOptions[i].name}
            />
          ))}
        </div>
        {/* Continue/Start Button */}
        <button
          className="username-continue-btn"
          disabled={!username.trim()}
          onClick={handleContinue}
          type="button"
        >
          Start Journey
        </button>
        {error && <div className="username-error">{error}</div>}
      </div>
    </div>
  );
}
