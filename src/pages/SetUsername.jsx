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
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        background: "radial-gradient(ellipse at 50% 0, #23243b 80%, #151625 100%)",
      }}
    >
      <div className="bg-[#181926] rounded-3xl p-10 shadow-2xl flex flex-col items-center w-[430px]">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Set Your Username
        </h2>
        <input
          className="w-full mb-6 px-4 py-3 rounded-xl bg-[#23243b] text-lg text-white border-none outline-none focus:ring-2 focus:ring-orange-400 transition"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={18}
        />
        <div className="flex flex-col items-center w-full mb-2">
          <div className="relative flex flex-row items-center w-full justify-center">
            <button
              aria-label="Prev"
              onClick={prev}
              className="absolute left-0 ml-[-60px] text-3xl text-orange-400 hover:text-orange-200 transition select-none z-10"
              tabIndex={0}
              style={{ outline: "none" }}
            >
              &#8592;
            </button>
            <div
              className="flex flex-col items-center justify-center w-[170px] h-[170px] mx-12 bg-[#23243b] rounded-2xl border-4"
              style={{
                borderColor:
                  "linear-gradient(90deg, #FFB800 0%, #FF5F6D 100%)",
                boxShadow:
                  selected === 0
                    ? "0 0 0 4px #FFB800, 0 0 12px 0 #FF5F6D"
                    : "0 0 16px 0 #23243b",
                border: selected === 0
                  ? "4px solid #FFB800"
                  : "4px solid #2e2f43",
                transition: "border 0.2s",
              }}
            >
              <img
                src={characterOptions[selected].img}
                alt={characterOptions[selected].name}
                className="w-28 h-28 object-contain pointer-events-none"
                draggable={false}
                style={{
                  filter:
                    "drop-shadow(0 0 8px #FFB80070) drop-shadow(0 0 20px #23243b70)",
                }}
              />
            </div>
            <button
              aria-label="Next"
              onClick={next}
              className="absolute right-0 mr-[-60px] text-3xl text-orange-400 hover:text-orange-200 transition select-none z-10"
              tabIndex={0}
            >
              &#8594;
            </button>
          </div>
          <div className="mt-5 text-xl font-bold text-white tracking-wide">
            {characterOptions[selected].name}
          </div>
        </div>
        <div className="mb-7 mt-2 text-orange-400 font-medium text-lg text-center">
          Choose your character
        </div>
        <button
          className="mt-2 bg-[#6C5DD3] hover:bg-[#5145a9] text-white font-bold py-2 px-8 rounded-xl text-lg transition shadow-xl"
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
