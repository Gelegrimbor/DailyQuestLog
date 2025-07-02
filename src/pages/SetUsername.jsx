import { useState } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const characterOptions = [
  { name: "Knight", img: "/images/hero1.gif" },
  { name: "Rogue",  img: "/images/hero2.gif" },
  { name: "Mage",   img: "/images/hero3.gif" },
  { name: "Paladin",img: "/images/hero4.gif" },
  { name: "Hunter", img: "/images/hero5.gif" },
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
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 0, #23243b 80%, #151625 100%)",
      }}
    >
      <div className="bg-[#181926] rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-white mb-5 text-center">
          Set Your Username
        </h2>
        <input
          className="w-full mb-6 px-4 py-3 rounded-xl bg-[#23243b] text-lg text-white border-none outline-none focus:ring-2 focus:ring-orange-400 transition"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
        />
        {/* Character select carousel */}
        <div className="flex flex-col items-center w-full mb-1">
          <div className="flex items-center justify-center">
            <button
              aria-label="Prev"
              onClick={prev}
              className="text-3xl text-orange-400 hover:text-orange-200 rounded-full w-10 h-10 flex items-center justify-center transition"
              tabIndex={0}
            >
              &#8592;
            </button>
            <div
              className="flex flex-col items-center justify-center mx-6 bg-[#23243b] rounded-2xl border-4"
              style={{
                borderColor: "#FFB800",
                boxShadow: selected === 0 ? "0 0 8px 1px #FFB800" : "",
                width: "180px",
                height: "180px",
                overflow: "hidden"
              }}
            >
              <img
                src={characterOptions[selected].img}
                alt={characterOptions[selected].name}
                className="object-contain"
                style={{ width: "150px", height: "150px", imageRendering: "pixelated" }}
                draggable={false}
              />
            </div>
            <button
              aria-label="Next"
              onClick={next}
              className="text-3xl text-orange-400 hover:text-orange-200 rounded-full w-10 h-10 flex items-center justify-center transition"
              tabIndex={0}
            >
              &#8594;
            </button>
          </div>
          <div className="mt-3 text-xl font-bold text-white tracking-wide">
            {characterOptions[selected].name}
          </div>
        </div>
        <div className="mb-5 mt-1 text-orange-400 font-medium text-lg text-center">
          Choose your character
        </div>
        <button
          className="mt-2 bg-[#6C5DD3] hover:bg-[#5145a9] text-white font-bold py-2 px-8 rounded-xl text-lg transition shadow-xl w-full"
          onClick={handleContinue}
          disabled={!username.trim()}
        >
          Continue
        </button>
        {error && (
          <div className="text-red-400 mt-3 font-medium text-base">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
