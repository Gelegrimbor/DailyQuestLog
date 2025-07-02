import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tasks, setTasks] = useState({
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [newTask, setNewTask] = useState("");
  const [completedTasks, setCompletedTasks] = useState({
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [], Sunday: []
  });

  const [username, setUsername] = useState("Loading...");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(20);
  const [enemyHp, setEnemyHp] = useState(25);
  const [maxEnemyHp, setMaxEnemyHp] = useState(25);
  const [damageDealt, setDamageDealt] = useState(null);
  const [enemyName, setEnemyName] = useState("Skeleton");
  const [enemyImage, setEnemyImage] = useState("/images/enemy1.gif");
  const [userId, setUserId] = useState(null);

  const damagePerLevel = { 1: 5, 2: 5, 3: 10, 4: 10, 5: 20 };

  const enemyInfo = {
    1: { hp: 25, name: "Skeleton", img: "/images/enemy1.gif", xp: 20 },
    2: { hp: 30, name: "Goblin", img: "/images/enemy2.gif", xp: 30 },
    3: { hp: 50, name: "Troll", img: "/images/enemy3.gif", xp: 50 },
    4: { hp: 100, name: "Dragon", img: "/images/enemy4.gif", xp: 100 },
    5: { hp: 500, name: "Demon Lord", img: "/images/enemy5.gif", xp: 999 },
  };

  // --- Firestore Save/Load Tasks ---
  // Save tasks to Firestore
  const saveTasks = async (newTasks, newCompleted) => {
    if (!userId) return;
    await setDoc(doc(db, "users", userId, "tasks", "days"), newTasks);
    await setDoc(doc(db, "users", userId, "tasks", "completed"), newCompleted);
  };

  // Fetch tasks from Firestore
  const fetchTasks = async (uid) => {
    const tasksRef = doc(db, "users", uid, "tasks", "days");
    const completedRef = doc(db, "users", uid, "tasks", "completed");
    let userTasks = {
      Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
    let userCompleted = {
      Monday: [], Tuesday: [], Wednesday: [],
      Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
    const tasksSnap = await getDoc(tasksRef);
    if (tasksSnap.exists()) userTasks = { ...userTasks, ...tasksSnap.data() };
    const completedSnap = await getDoc(completedRef);
    if (completedSnap.exists()) userCompleted = { ...userCompleted, ...completedSnap.data() };
    setTasks(userTasks);
    setCompletedTasks(userCompleted);
  };

  // --- XP/ENEMY FIRESTORE SYNC ---

  const saveStats = async (newLevel, newXp, newEnemyHp, newMaxHp) => {
    if (!userId) return;
    await setDoc(
      doc(db, "users", userId, "stats", "progress"),
      {
        level: newLevel,
        xp: newXp,
        enemyHp: newEnemyHp,
        maxEnemyHp: newMaxHp
      },
      { merge: true }
    );
  };

  // --- QUEST PANEL LOGIC ---

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const updatedTasks = { ...tasks, [selectedDay]: [...tasks[selectedDay], newTask] };
    setTasks(updatedTasks);
    setNewTask("");
    await saveTasks(updatedTasks, completedTasks);
  };

  const handleDeleteTask = async (index) => {
    const updated = [...tasks[selectedDay]];
    updated.splice(index, 1);
    const updatedTasks = { ...tasks, [selectedDay]: updated };
    setTasks(updatedTasks);
    await saveTasks(updatedTasks, completedTasks);
  };

  const handleCompleteTask = async (index) => {
    const task = tasks[selectedDay][index];
    const updatedTasks = [...tasks[selectedDay]];
    const updatedCompleted = [...completedTasks[selectedDay]];
    updatedTasks.splice(index, 1);
    updatedCompleted.push(task);

    const allTasks = { ...tasks, [selectedDay]: updatedTasks };
    const allCompleted = { ...completedTasks, [selectedDay]: updatedCompleted };

    setTasks(allTasks);
    setCompletedTasks(allCompleted);
    await saveTasks(allTasks, allCompleted);

    // Damage + Progress logic
    const damage = damagePerLevel[level] || 5;
    setDamageDealt(`-${damage}`);
    setTimeout(() => setDamageDealt(null), 800);

    setEnemyHp(prev => {
      const newHp = Math.max(0, prev - damage);
      if (newHp === 0) {
        const newLevel = Math.min(level + 1, 5);
        const newEnemy = enemyInfo[newLevel];
        setLevel(newLevel);
        setXp(0);
        setXpToNextLevel(newEnemy.xp);
        setEnemyHp(newEnemy.hp);
        setMaxEnemyHp(newEnemy.hp);
        setEnemyName(newEnemy.name);
        setEnemyImage(newEnemy.img);
        saveStats(newLevel, 0, newEnemy.hp, newEnemy.hp);
      } else {
        const xpGain = damage;
        const newXp = xp + xpGain;
        if (newXp >= xpToNextLevel) {
          const newLevel = Math.min(level + 1, 5);
          const newEnemy = enemyInfo[newLevel];
          setLevel(newLevel);
          setXp(0);
          setXpToNextLevel(newEnemy.xp);
          setEnemyHp(newEnemy.hp);
          setMaxEnemyHp(newEnemy.hp);
          setEnemyName(newEnemy.name);
          setEnemyImage(newEnemy.img);
          saveStats(newLevel, 0, newEnemy.hp, newEnemy.hp);
        } else {
          setXp(newXp);
          saveStats(level, newXp, newHp, maxEnemyHp);
        }
      }
      return newHp;
    });
  };

  const handleUncompleteTask = async (index) => {
    const task = completedTasks[selectedDay][index];
    const updatedCompleted = [...completedTasks[selectedDay]];
    const updatedTasks = [...tasks[selectedDay]];
    updatedCompleted.splice(index, 1);
    updatedTasks.push(task);

    const allTasks = { ...tasks, [selectedDay]: updatedTasks };
    const allCompleted = { ...completedTasks, [selectedDay]: updatedCompleted };

    setCompletedTasks(allCompleted);
    setTasks(allTasks);
    await saveTasks(allTasks, allCompleted);
  };

  const getCurrentDay = () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[new Date().getDay()];
  };

  // --- FIRESTORE LOAD ON LOGIN ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // Load XP/level/enemy stats
        const statsRef = doc(db, "users", user.uid, "stats", "progress");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          setLevel(data.level || 1);
          setXp(data.xp || 0);
          setEnemyHp(data.enemyHp || 25);
          setMaxEnemyHp(data.maxEnemyHp || 25);
          const enemy = enemyInfo[data.level || 1];
          setEnemyName(enemy.name);
          setEnemyImage(enemy.img);
          setXpToNextLevel(enemy.xp);
        }

        // Load username
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setUsername(userDoc.data().username || "Adventurer");
        else setUsername("Unknown User");

        // Load tasks
        await fetchTasks(user.uid);
      } else {
        setUserId(null);
        setUsername("Not logged in");
        setTasks({
          Monday: [], Tuesday: [], Wednesday: [],
          Thursday: [], Friday: [], Saturday: [], Sunday: []
        });
        setCompletedTasks({
          Monday: [], Tuesday: [], Wednesday: [],
          Thursday: [], Friday: [], Saturday: [], Sunday: []
        });
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSelectedDay(getCurrentDay());
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="day-navigation">
          <h2 className="section-title">Quest Calendar</h2>
          <div className="day-selector">
            {Object.keys(tasks).map((day) => (
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

        <div className="main-content">
          <div className="quest-panel">
            <div className="panel-header">
              <h2 className="quest-title">
                {selectedDay}'s Quests {getCurrentDay() === selectedDay && <span className="today-badge">Today</span>}
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
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              />
              <button onClick={handleAddTask} className="quest-add-btn">Add Quest</button>
            </div>

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
                        <span className="quest-reward">+XP</span>
                      </div>
                      <div className="quest-actions">
                        <button onClick={() => handleCompleteTask(i)} className="quest-complete">✓</button>
                        <button onClick={() => handleDeleteTask(i)} className="quest-delete">✕</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {completedTasks[selectedDay].length > 0 && (
              <div className="quest-section">
                <h3 className="quest-section-title">Completed Quests</h3>
                <ul className="quest-list">
                  {completedTasks[selectedDay].map((task, i) => (
                    <li key={i} className="quest-item completed">
                      <div className="quest-content">
                        <span className="quest-text">{task}</span>
                        <span className="quest-reward completed">+XP</span>
                      </div>
                      <div className="quest-actions">
                        <button onClick={() => handleUncompleteTask(i)} className="quest-undo">↶</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="right-panels">
            <div className="user-panel">
              <div className="character-header">
                <h2 className="section-title">Your Character</h2>
              </div>
              <div className="character-avatar">
                <img src="/images/user.png" alt="User" className="avatar-img" />
              </div>
              <h3 className="username">{username}</h3>
              <div className="character-bars">
                <div className="stat-bar">
                  <label>Level {level}</label>
                  <div className="bar-container">
                    <div className="bar xp-bar">
                      <div className="bar-fill xp-fill" style={{ width: `${(xp / xpToNextLevel) * 100}%` }}></div>
                    </div>
                  </div>
                  <span className="bar-text">{xp} / {xpToNextLevel}</span>
                </div>
              </div>
            </div>

            <div className="enemy-panel">
              <div className="character-header">
                <h2 className="section-title">Enemy Encounter</h2>
              </div>
              <div className="character-avatar">
                <img src={enemyImage} alt="Enemy" className="avatar-img" />
              </div>
              <h3 className="enemy-name">{enemyName}</h3>
              <div className="character-bars">
                <div className="stat-bar">
                  <label>Health</label>
                  <div className="bar-container">
                    <div className="bar hp-bar">
                      <div className="bar-fill hp-fill" style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }}></div>
                    </div>
                  </div>
                  <span className="bar-text">{enemyHp} / {maxEnemyHp}</span>
                </div>
              </div>
              {damageDealt && <div className="floating-damage">{damageDealt}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
