import { useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const characterOptions = [
  { name: "Sion Chop", img: "/images/hero1.gif" },
  { name: "Knight", img: "/images/hero2.gif" },
  { name: "Lvl7 Mastery", img: "/images/hero3.gif" },
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
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
         }}>
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Create Your Hero
          </h1>
          <p className="text-white/70 text-lg">
            Choose your character and set your username
          </p>
        </div>

        {/* Username Input */}
        <div className="mb-8">
          <label className="block text-white/90 text-sm font-medium mb-3">
            Username
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={18}
          />
          {error && (
            <p className="text-red-300 text-sm mt-2 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Character Selection */}
        <div className="mb-8">
          <label className="block text-white/90 text-sm font-medium mb-4">
            Choose Your Character
          </label>
          
          {/* Character Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label="Previous character"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              aria-label="Next character"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Character Display */}
            <div className="mx-12 text-center">
              <div className="relative mb-4">
                <div 
                  className="w-40 h-40 mx-auto bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)"
                  }}
                >
                  <img
                    src={characterOptions[selected].img}
                    alt={characterOptions[selected].name}
                    className="w-32 h-32 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    draggable={false}
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-32 h-32 bg-white/20 rounded-lg items-center justify-center text-white/60 text-sm hidden"
                    style={{ display: 'none' }}
                  >
                    Character Image
                  </div>
                </div>
                
                {/* Character Name */}
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">
                  {characterOptions[selected].name}
                </h3>
              </div>

              {/* Character Dots Indicator */}
              <div className="flex justify-center space-x-2 mb-4">
                {characterOptions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelected(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === selected 
                        ? 'bg-white scale-125' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Select ${characterOptions[index].name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!username.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            username.trim()
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          {username.trim() ? 'Continue Your Adventure' : 'Enter Username to Continue'}
        </button>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          Ready to start your quest?
        </p>
      </div>
    </div>
  );
}