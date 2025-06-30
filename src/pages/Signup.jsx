import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import MiniHeader from "../components/MiniHeader";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      return setError("Please enter a valid email.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/set-username");
    } catch (err) {
      console.error("Signup failed:", err.message);
      setError("Signup failed. Email may already be in use.");
    }
  };

  return (
    <div className="auth-page">
      <MiniHeader />
      <div className="form-container">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSignup} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            className="auth-input auth-input-wide"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input auth-input-wide"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn auth-btn-narrow">Sign Up</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
