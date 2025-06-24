// Updated Dashboard.jsx with improved layout and extra functionality
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tasks, setTasks] = useState({
    Monday: ["Drink 2L of Water", "Breakfast"],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [newTask, setNewTask] = useState("");
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

  return (
    <div className="dashboard-wrapper">
      <Header />

      <div className="dashboard-layout">
        <div className="day-selector">
          {days.map((day) => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? "active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="quest-panel">
          <h2 className="quest-title">{selectedDay}'s Quests</h2>
          <div className="add-task">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New quest..."
              className="task-input"
            />
            <button onClick={handleAddTask} className="task-add">Add</button>
          </div>

          <ul className="task-list">
            {tasks[selectedDay].map((task, i) => (
              <li key={i} className="task-item">
                {task}
                <button onClick={() => handleDeleteTask(i)} className="task-del">✕</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="user-panel">
          <div className="avatar-box">
            <img src="/images/archer.png" alt="avatar" className="avatar-img" />
            <div className="hp-bar">20 / 20 HP</div>
          </div>

          <div className="stats-box">
            <h3>Stats</h3>
            <p>Level: 1</p>
            <p>XP: 0 / 20</p>
            <p>Completed: 0</p>
            <p>Streak: 0 days</p>
            <p>Damage per Quest: 2</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}
