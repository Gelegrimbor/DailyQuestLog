// Enhanced Dashboard.jsx with improved RPG-themed design
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tasks, setTasks] = useState({
    Monday: ["Drink 2L of Water", "Morning Exercise"],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [newTask, setNewTask] = useState("");
  const [completedTasks, setCompletedTasks] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    maxXp: 20,
    hp: 20,
    maxHp: 20,
    streak: 0,
    totalCompleted: 0
  });
  const navigate = useNavigate();

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks({
      ...tasks,
      [selectedDay]: [...tasks[selectedDay], newTask],
    });
    setNewTask("");
  };

  const handleDeleteTask = (index) => {
    const updated = [...tasks[selectedDay]];
    updated.splice(index, 1);
    setTasks({ ...tasks, [selectedDay]: updated });
  };

  const handleCompleteTask = (index) => {
    const task = tasks[selectedDay][index];
    const updatedTasks = [...tasks[selectedDay]];
    const updatedCompleted = [...completedTasks[selectedDay]];
    
    updatedTasks.splice(index, 1);
    updatedCompleted.push(task);
    
    setTasks({ ...tasks, [selectedDay]: updatedTasks });
    setCompletedTasks({ ...completedTasks, [selectedDay]: updatedCompleted });
    
    // Update user stats
    setUserStats(prev => {
      const newXp = prev.xp + 5;
      const levelUp = newXp >= prev.maxXp;
      return {
        ...prev,
        xp: levelUp ? newXp - prev.maxXp : newXp,
        level: levelUp ? prev.level + 1 : prev.level,
        maxXp: levelUp ? prev.maxXp + 10 : prev.maxXp,
        totalCompleted: prev.totalCompleted + 1
      };
    });
  };

  const handleUncompleteTask = (index) => {
    const task = completedTasks[selectedDay][index];
    const updatedCompleted = [...completedTasks[selectedDay]];
    const updatedTasks = [...tasks[selectedDay]];
    
    updatedCompleted.splice(index, 1);
    updatedTasks.push(task);
    
    setCompletedTasks({ ...completedTasks, [selectedDay]: updatedCompleted });
    setTasks({ ...tasks, [selectedDay]: updatedTasks });
    
    // Update user stats (decrease)
    setUserStats(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - 5),
      totalCompleted: Math.max(0, prev.totalCompleted - 1)
    }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const days = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const getDayProgress = (day) => {
    const total = tasks[day].length + completedTasks[day].length;
    const completed = completedTasks[day].length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCurrentDay = () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[new Date().getDay()];
  };

  useEffect(() => {
    setSelectedDay(getCurrentDay());
  }, []);

  return (
    <div className="dashboard-wrapper">
      
      <div className="dashboard-container">
        {/* Day Navigation */}
        <div className="day-navigation">
          <h2 className="section-title">Quest Calendar</h2>
          <div className="day-selector">
            {days.map((day) => (
              <button
                key={day}
                className={`day-btn ${selectedDay === day ? "active" : ""} ${getCurrentDay() === day ? "today" : ""}`}
                onClick={() => setSelectedDay(day)}
              >
                <span className="day-name">{day.slice(0, 3)}</span>
                <span className="day-progress">{getDayProgress(day)}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Quest Panel */}
          <div className="quest-panel">
            <div className="panel-header">
              <h2 className="quest-title">
                {selectedDay}'s Quests
                {getCurrentDay() === selectedDay && <span className="today-badge">Today</span>}
              </h2>
              <div className="quest-stats">
                <span className="active-quests">{tasks[selectedDay].length} Active</span>
                <span className="completed-quests">{completedTasks[selectedDay].length} Completed</span>
              </div>
            </div>

            <div className="add-quest">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter a new quest..."
                className="quest-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <button onClick={handleAddTask} className="quest-add-btn">
                Add Quest
              </button>
            </div>

            {/* Active Quests */}
            <div className="quest-section">
              <h3 className="quest-section-title">Active Quests</h3>
              <ul className="quest-list">
                {tasks[selectedDay].length === 0 ? (
                  <li className="empty-state">No active quests for {selectedDay}</li>
                ) : (
                  tasks[selectedDay].map((task, i) => (
                    <li key={i} className="quest-item active">
                      <div className="quest-content">
                        <span className="quest-text">{task}</span>
                        <span className="quest-reward">+5 XP</span>
                      </div>
                      <div className="quest-actions">
                        <button 
                          onClick={() => handleCompleteTask(i)} 
                          className="quest-complete"
                          title="Complete Quest"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(i)} 
                          className="quest-delete"
                          title="Delete Quest"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Completed Quests */}
            {completedTasks[selectedDay].length > 0 && (
              <div className="quest-section">
                <h3 className="quest-section-title">Completed Quests</h3>
                <ul className="quest-list">
                  {completedTasks[selectedDay].map((task, i) => (
                    <li key={i} className="quest-item completed">
                      <div className="quest-content">
                        <span className="quest-text">{task}</span>
                        <span className="quest-reward completed">+5 XP</span>
                      </div>
                      <div className="quest-actions">
                        <button 
                          onClick={() => handleUncompleteTask(i)} 
                          className="quest-undo"
                          title="Mark as Incomplete"
                        >
                          ↶
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Character Panel */}
          <div className="character-panel">
            <div className="character-header">
              <h2 className="section-title">Character</h2>
            </div>

            <div className="character-avatar">
              <div className="avatar-container">
                <img src="/images/archer.png" alt="Character Avatar" className="avatar-img" />
                <div className="level-badge">Lv.{userStats.level}</div>
              </div>
              
              <div className="character-bars">
                <div className="stat-bar">
                  <label>Health</label>
                  <div className="bar-container">
                    <div className="bar hp-bar">
                      <div 
                        className="bar-fill hp-fill" 
                        style={{width: `${(userStats.hp / userStats.maxHp) * 100}%`}}
                      ></div>
                    </div>
                    <span className="bar-text">{userStats.hp}/{userStats.maxHp}</span>
                  </div>
                </div>

                <div className="stat-bar">
                  <label>Experience</label>
                  <div className="bar-container">
                    <div className="bar xp-bar">
                      <div 
                        className="bar-fill xp-fill" 
                        style={{width: `${(userStats.xp / userStats.maxXp) * 100}%`}}
                      ></div>
                    </div>
                    <span className="bar-text">{userStats.xp}/{userStats.maxXp}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="character-stats">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{userStats.level}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Quests Completed</span>
                  <span className="stat-value">{userStats.totalCompleted}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value">{userStats.streak} days</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">XP per Quest</span>
                  <span className="stat-value">5</span>
                </div>
              </div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}