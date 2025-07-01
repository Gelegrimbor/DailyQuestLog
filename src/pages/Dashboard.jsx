import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tasks, setTasks] = useState({
    Monday: [],
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

  const [enemyHp, setEnemyHp] = useState(100);
  const maxEnemyHp = 100;

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

    // Enemy takes damage
    setEnemyHp(prev => Math.max(0, prev - 10));
  };

  const handleUncompleteTask = (index) => {
    const task = completedTasks[selectedDay][index];
    const updatedCompleted = [...completedTasks[selectedDay]];
    const updatedTasks = [...tasks[selectedDay]];

    updatedCompleted.splice(index, 1);
    updatedTasks.push(task);

    setCompletedTasks({ ...completedTasks, [selectedDay]: updatedCompleted });
    setTasks({ ...tasks, [selectedDay]: updatedTasks });

    setEnemyHp(prev => Math.min(maxEnemyHp, prev + 10));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ];

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
                <span className="day-progress">
                  {completedTasks[day].length}/{tasks[day].length + completedTasks[day].length}
                </span>
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
                        <button onClick={() => handleCompleteTask(i)} className="quest-complete" title="Complete Quest">✓</button>
                        <button onClick={() => handleDeleteTask(i)} className="quest-delete" title="Delete Quest">✕</button>
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
                        <button onClick={() => handleUncompleteTask(i)} className="quest-undo" title="Mark as Incomplete">↶</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Enemy Panel */}
          <div className="character-panel">
            <div className="character-header">
              <h2 className="section-title">Enemy Encounter</h2>
            </div>
            <div className="character-avatar">
              <img src="/images/enemy.png" alt="Enemy" className="avatar-img" />
              <div className="level-badge">HP</div>
            </div>
            <div className="character-bars">
              <div className="stat-bar">
                <label>Enemy Health</label>
                <div className="bar-container">
                  <div className="bar hp-bar">
                    <div
                      className="bar-fill hp-fill"
                      style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }}
                    ></div>
                  </div>
                  <span className="bar-text">{enemyHp}/{maxEnemyHp}</span>
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
