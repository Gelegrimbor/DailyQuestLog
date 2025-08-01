import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc
} from "firebase/firestore";
import { saveUserStats } from "../saveUserStats";
import { loadUserStats } from "../loadUserStats";


export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [tasks, setTasks] = useState({
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [completedTasks, setCompletedTasks] = useState({
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [], Sunday: []
  });
  const [newTask, setNewTask] = useState("");
  const [username, setUsername] = useState("Loading...");
  const [userCharacter, setUserCharacter] = useState({
    name: "Knight",
    img: "/images/hero2.gif"
  });
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(20);
  const [enemyHp, setEnemyHp] = useState(25);
  const [maxEnemyHp, setMaxEnemyHp] = useState(25);
  const [damageDealt, setDamageDealt] = useState(null);
  const [enemyName, setEnemyName] = useState("Skeleton");
  const [enemyImage, setEnemyImage] = useState("/images/enemy1.gif");
  const [userId, setUserId] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [completedLoaded, setCompletedLoaded] = useState(false);

  // Load saved stats from Firestore
  useEffect(() => {
    const fetchStats = async () => {
      if (userId) {
        const stats = await loadUserStats(userId);
        if (stats) {
          setLevel(stats.level);
          setXp(stats.xp);
          setEnemyHp(stats.enemyHp);
          setMaxEnemyHp(stats.maxEnemyHp);
          console.log("📥 Loaded user stats:", stats);
        }
      }
    };
    fetchStats();
  }, [userId]);


  const damagePerLevel = {
    1: 5, 2: 10, 3: 10, 4: 10, 5: 20,
  };

  const enemyInfo = {
    1: { hp: 30, name: "Skeleton", img: "/images/enemy1.gif", xp: 20 },
    2: { hp: 40, name: "Goblin", img: "/images/enemy2.gif", xp: 30 },
    3: { hp: 50, name: "Troll", img: "/images/enemy3.gif", xp: 50 },
    4: { hp: 100, name: "Dragon", img: "/images/enemy4.gif", xp: 100 },
    5: { hp: 5000, name: "Demon Lord", img: "/images/enemy5.gif", xp: 999 },
  };

  // --- Firestore helpers ---
  const getTasksRef = (docName) =>
    userId ? doc(db, "users", userId, "tasks", docName) : null;
  const getStatsRef = () =>
    userId ? doc(db, "users", userId, "stats", "progress") : null;

  // --- Load user and data on mount ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // Username & Character
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "Adventurer");
          setUserCharacter(userData.character || {
            name: "Knight",
            img: "/images/hero2.gif"
          });
        } else {
          setUsername("Adventurer");
          setUserCharacter({
            name: "Knight",
            img: "/images/hero2.gif"
          });
        }

        // Stats (level/xp/enemyHp)
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
        } else {
          // Create doc if doesn't exist
          await setDoc(statsRef, {
            level: 1, xp: 0, enemyHp: 25, maxEnemyHp: 25
          });
        }
        const defaultTasks = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        };

        const daysRef = getTasksRef("days");
        const completedRef = getTasksRef("completed");
        const daysSnap = await getDoc(daysRef);
        const completedSnap = await getDoc(completedRef);

        if (!daysSnap.exists()) {
          await setDoc(daysRef, defaultTasks);
        }
        if (!completedSnap.exists()) {
          await setDoc(completedRef, defaultTasks);
        }

        setTasks(daysSnap.exists() ? daysSnap.data() : defaultTasks);
        setTasksLoaded(true);

        setCompletedTasks(
          completedSnap.exists() ? completedSnap.data() : defaultTasks
        );
        setCompletedLoaded(true);
      } else {
        setUserId(null);
        setUsername("Not logged in");
        setUserCharacter({
          name: "Knight",
          img: "/images/hero2.gif"
        });
        setHasLoaded(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  // --- Save tasks to Firestore on change ---
  useEffect(() => {
    if (!userId || !tasksLoaded) return;
    updateDoc(getTasksRef("days"), tasks).catch(() =>
      setDoc(getTasksRef("days"), tasks)
    );
  }, [tasks, userId, tasksLoaded]);

  useEffect(() => {
    if (!userId || !completedLoaded) return;
    updateDoc(getTasksRef("completed"), completedTasks).catch(() =>
      setDoc(getTasksRef("completed"), completedTasks)
    );
  }, [completedTasks, userId, completedLoaded]);

  // --- Task Handlers ---
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const updated = {
      ...tasks,
      [selectedDay]: [...tasks[selectedDay], newTask]
    };
    setTasks(updated);
    if (userId) {
      updateDoc(getTasksRef("days"), { [selectedDay]: updated[selectedDay] }).catch(
        () => setDoc(getTasksRef("days"), updated)
      );
    }
    setNewTask("");
  };

  const handleDeleteTask = (idx) => {
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== idx)
    }));
  };

  const handleCompleteTask = (idx) => {
    const task = tasks[selectedDay][idx];
    const updatedTasks = {
      ...tasks,
      [selectedDay]: tasks[selectedDay].filter((_, i) => i !== idx)
    };
    const updatedCompleted = {
      ...completedTasks,
      [selectedDay]: [...completedTasks[selectedDay], task]
    };
    setTasks(updatedTasks);
    setCompletedTasks(updatedCompleted);
    if (userId) {
      updateDoc(getTasksRef("days"), { [selectedDay]: updatedTasks[selectedDay] }).catch(
        () => setDoc(getTasksRef("days"), updatedTasks)
      );
      updateDoc(getTasksRef("completed"), {
        [selectedDay]: updatedCompleted[selectedDay]
      }).catch(() => setDoc(getTasksRef("completed"), updatedCompleted));
    }

    // XP/Enemy system:
    const damage = damagePerLevel[level] || 5;
    setDamageDealt(`-${damage}`);
    setTimeout(() => setDamageDealt(null), 800);

    // XP/Level/Enemy progress update
    setEnemyHp((prevHp) => {
      let newHp = Math.max(0, prevHp - damage);
      let newXp = xp;
      let newLevel = level;
      let newEnemy = enemyInfo[level];
      let newMaxHp = maxEnemyHp;

      if (newHp <= 0) {
        newXp += xpToNextLevel;
        newLevel = Math.min(level + 1, 5);
        newEnemy = enemyInfo[newLevel];
        newHp = newEnemy.hp;
        newMaxHp = newEnemy.hp;
        newXp = 0;
        setLevel(newLevel);
        setEnemyName(newEnemy.name);
        setEnemyImage(newEnemy.img);
        setXpToNextLevel(newEnemy.xp);
      }
      setXp(newXp);
      setMaxEnemyHp(newMaxHp);

      // SAVE PROGRESS TO FIRESTORE
      if (userId) {
        saveUserStats(userId, {
          level: newLevel,
          xp: newXp,
          enemyHp: newHp,
          maxEnemyHp: newMaxHp,
        });
      }

      return newHp;
    });
  };

  const handleUncompleteTask = (idx) => {
    const task = completedTasks[selectedDay][idx];
    setCompletedTasks((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== idx)
    }));
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], task]
    }));
  };

  // --- Init selected day on mount
  useEffect(() => {
    const dayNames = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    setSelectedDay(dayNames[new Date().getDay()]);
  }, []);

  // --- UI ---
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="day-navigation">
          <h2 className="section-title">Quest Calendar</h2>
          <div className="day-selector">
            {Object.keys(tasks).map((day) => (
              <button
                key={day}
                className={`day-btn ${selectedDay === day ? "active" : ""} ${new Date().toLocaleDateString("en-US", { weekday: "long" }) === day ? "today" : ""}`}
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
                {selectedDay}'s Quests {new Date().toLocaleDateString("en-US", { weekday: "long" }) === selectedDay && <span className="today-badge">Today</span>}
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
                <img src={userCharacter.img} alt={userCharacter.name} className="avatar-img" />
              </div>
              <div className="char-name" style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem", marginBottom: 2 }}>{userCharacter.name}</div>
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
                <img src={enemyImage} alt={enemyName} className="avatar-img" />
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
