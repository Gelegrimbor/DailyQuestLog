import { useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiSettings, FiTrendingUp } from "react-icons/fi";
import { auth } from "../firebase";

export default function Header() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo/Brand */}
        <div className="header-brand" onClick={() => navigate("/")}>
          <div className="brand-icon">⚔️</div>
          <h1 className="brand-title">QuestLog</h1>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <button 
            className="nav-btn" 
            onClick={() => navigate("/")}
            title="Home"
          >
            <FiHome size={20} />
            <span>Home</span>
          </button>
          
          <button 
            className="nav-btn active" 
            onClick={() => navigate("/dashboard")}
            title="Dashboard"
          >
            <FiTrendingUp size={20} />
            <span>Dashboard</span>
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => navigate("/profile")}
            title="Profile"
          >
            <FiUser size={20} />
            <span>Profile</span>
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => navigate("/settings")}
            title="Settings"
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Info */}
        <div className="header-user">
          <div className="user-info">
            <span className="user-greeting">Welcome back!</span>
            <span className="user-email">{user?.email || 'Adventurer'}</span>
          </div>
          <div className="user-avatar">
            <div className="avatar-placeholder">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}