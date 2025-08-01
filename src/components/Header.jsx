import { useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiSettings, FiTrendingUp } from "react-icons/fi";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleNav = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo */}
        <div className="header-brand" onClick={() => navigate("/")}>
          <div className="brand-icon">⚔️</div>
          <h1 className="brand-title">QuestLog</h1>
        </div>

        {/* Navigation - Centered */}
        <nav className="header-nav" style={{ flex: 1, justifyContent: "center", display: "flex", gap: "1.5rem" }}>
          <button className="nav-btn" onClick={() => handleNav("/dashboard")} title="Dashboard">
            <FiTrendingUp size={20} />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="header-user">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-greeting">Welcome back!</span>
                <span className="user-name">{username}</span>
              </div>
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => signOut(auth)}
                className={`nav-btn ${location.pathname === "/dashboard" ? "logout-red" : "logout-green"}`}
              >
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="nav-btn">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
