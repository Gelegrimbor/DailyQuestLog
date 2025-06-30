import { useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiTrendingUp } from "react-icons/fi";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";

export default function Header() {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

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

        {/* Navigation */}
        <nav className="header-nav">
          <button className="nav-btn" onClick={() => handleNav("/dashboard")} title="Dashboard">
            <FiTrendingUp size={20} />
            <span>Dashboard</span>
          </button>

          <button className="nav-btn" onClick={() => handleNav("/profile")} title="Profile">
            <FiUser size={20} />
            <span>Profile</span>
          </button>

          <button className="nav-btn" onClick={() => handleNav("/settings")} title="Settings">
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Info or Logout */}
        <div className="header-user">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-greeting">Welcome back!</span>
                <span className="user-email">{user.email}</span>
              </div>
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button onClick={() => signOut(auth)} className="nav-btn">
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
