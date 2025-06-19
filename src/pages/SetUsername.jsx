import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function SetUsername() {
  const [username, setUsername] = useState("");
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
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving username:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Set Your Username</h2>
      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Continue</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
