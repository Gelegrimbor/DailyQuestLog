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
      setError("Enter a username!");
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

  const next = () => setSelected((prev) => (prev + 1) % characterOptions.length);
  const prev = () => setSelected((prev) => (prev - 1 + characterOptions.length) % characterOptions.length);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0, #23243b 80%, #151625 100%)",
      }}
    >
      <div className="bg-[#181926] rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-lg w-full">
        {/* Header */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Set Your Username
        </h2>

        {/* Username Input */}
        <input
          className="w-full mb-6 px-4 py-3 rounded-xl bg-[#23243b] text-lg text-white border-none outline-none focus:ring-2 focus:ring-orange-400 transition placeholder-white/50"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
        />

        {/* Character Selection */}
        <div className="flex flex-col items-center w-full mb-6">
          <h3 className="text-xl text-orange-400 font-medium mb-4">
            Choose your character
          </h3>
          
          {/* Character Carousel */}
          <div className="flex items-center justify-center mb-4">
            {/* Left Arrow */}
            <button
              onClick={prev}
              className="text-4xl text-orange-400 hover:text-orange-200 transition-colors duration-200 mr-6 w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#23243b]"
              aria-label="Previous character"
            >
              ←
            </button>

            {/* Character Display Box */}
            <div
              className="bg-[#23243b] rounded-2xl border-4 border-[#FFB800] flex items-center justify-center overflow-hidden"
              style={{
                width: "300px",
                height: "300px",
                boxShadow: "0 0 15px 2px rgba(255, 184, 0, 0.3)"
              }}
            >
              <img
                src={characterOptions[selected].img}
                alt={characterOptions[selected].name}
                className="object-contain max-w-full max-h-full"
                style={{ 
                  imageRendering: "pixelated",
                  width: "250px",
                  height: "250px"
                }}
                draggable={false}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if image doesn't load */}
              <div 
                className="w-full h-full bg-[#2a2b42] rounded-lg flex items-center justify-center text-white/60 text-lg font-medium hidden"
              >
                {characterOptions[selected].name}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={next}
              className="text-4xl text-orange-400 hover:text-orange-200 transition-colors duration-200 ml-6 w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#23243b]"
              aria-label="Next character"
            >
              →
            </button>
          </div>

          {/* Character Name */}
          <div className="text-2xl font-bold text-white mb-3 text-center">
            {characterOptions[selected].name}
          </div>

          {/* Dot Indicators */}
          <div className="flex space-x-2">
            {characterOptions.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelected(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === selected 
                    ? 'bg-orange-400 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Select ${characterOptions[index].name}`}
              />
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          className={`w-full py-3 px-8 rounded-xl text-lg font-bold transition-all duration-200 ${
            username.trim()
              ? 'bg-[#6C5DD3] hover:bg-[#5145a9] text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02]'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleContinue}
          disabled={!username.trim()}
        >
          Continue
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 mt-4 font-medium text-base text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}