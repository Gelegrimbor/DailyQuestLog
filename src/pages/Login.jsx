import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      return setError("Please enter a valid email.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Invalid email or password.");
    }
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleLogin} className="auth-form">
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
          <button type="submit" className="auth-btn auth-btn-narrow">Login</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>
    </>
  );
}
