import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { FiHome } from "react-icons/fi";
import "../styles/app.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="form-container">
      {/* Header with Home Button */}
      <div className="auth-header">
        <button onClick={() => navigate("/")} className="home-btn">
          <FiHome size={20} />
        </button>
        <h2 className="auth-title">Login</h2>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-btn">
          Login
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
