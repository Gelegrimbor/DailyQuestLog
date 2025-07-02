import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
  const [enemyImage, setEnemyImage] = useState("/images/enemy1.png");

  const damagePerLevel = { 1: 5, 2: 5, 3: 10, 4: 10, 5: 20 };
  const enemyInfo = {
    1: { hp: 25, name: "Skeleton", img: "/images/enemy1.png", xp: 20 },
    2: { hp: 30, name: "Goblin", img: "/images/enemy2.png", xp: 30 },
    3: { hp: 50, name: "Troll", img: "/images/enemy3.png", xp: 50 },
    4: { hp: 100, name: "Dragon", img: "/images/enemy4.png", xp: 100 },
    5: { hp: 500, name: "Demon Lord", img: "/images/enemy5.png", xp: 999 }
  };

  // Firestore progress sync (XP/level/enemy)
  const saveStats = async (newLevel, newXp, newEnemyHp, newMaxHp) => {
    const user = auth.currentUser;
    if (!user) return;
    const statsRef = doc(db, "users", user.uid, "stats", "progress");
    await updateDoc(statsRef, {
      level: newLevel,
      xp: newXp,
      enemyHp: newEnemyHp,
      maxEnemyHp: newMaxHp
    });
  };

  // Add Quest
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks({ ...tasks, [selectedDay]: [...tasks[selectedDay], newTask] });
    setNewTask("");
  };

  // Delete Quest
  const handleDeleteTask = (index) => {
    const updated = [...tasks[selectedDay]];
    updated.splice(index, 1);
    setTasks({ ...tasks, [selectedDay]: updated });
  };

  // Complete Quest & damage enemy
  const handleCompleteTask = (index) => {
    const task = tasks[selectedDay][index];
    const updatedTasks = [...tasks[selectedDay]];
    const updatedCompleted = [...completedTasks[selectedDay]];
    updatedTasks.splice(index, 1);
    updatedCompleted.push(task);

    setTasks({ ...tasks, [selectedDay]: updatedTasks });
    setCompletedTasks({ ...completedTasks, [selectedDay]: updatedCompleted });

    const damage = damagePerLevel[level] || 5;
    setDamageDealt(`-${damage}`);
    setTimeout(() => setDamageDealt(null), 800);

    setEnemyHp(prevHp => {
      const newHp = Math.max(0, prevHp - damage);
      if (newHp === 0) {
        // Enemy defeated: Level up
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
          // XP overflow: Level up!
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

  // Undo Quest Completion
  const handleUncompleteTask = (index) => {
    const task = completedTasks[selectedDay][index];
    const updatedCompleted = [...completedTasks[selectedDay]];
    const updatedTasks = [...tasks[selectedDay]];
    updatedCompleted.splice(index, 1);
    updatedTasks.push(task);

    setCompletedTasks({ ...completedTasks, [selectedDay]: updatedCompleted });
    setTasks({ ...tasks, [selectedDay]: updatedTasks });
  };

  // Show current day on mount
  useEffect(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    setSelectedDay(dayNames[new Date().getDay()]);
  }, []);

  // Fetch username and XP/level/enemy from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get username
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || "Adventurer");
        } else {
          setUsername("Unknown User");
        }
        // Get stats/progress
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
          // If user has no stats yet, initialize them
          await setDoc(statsRef, {
            level: 1,
            xp: 0,
            enemyHp: 25,
            maxEnemyHp: 25
          });
        }
      } else {
        setUsername("Not logged in");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Day navigation */}
        <div className="day-navigation">
          <h2 className="section-title">Quest Calendar</h2>
          <div className="day-selector">
            {Object.keys(tasks).map((day) => (
              <button
                key={day}
                className={`day-btn ${selectedDay === day ? "active" : ""}`}
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
          {/* Quest panel */}
          <div className="quest-panel">
            <div className="panel-header">
              <h2 className="quest-title">{selectedDay}'s Quests</h2>
              <div className="quest-stats">
                <span>{tasks[selectedDay].length} Active</span>
                <span>{completedTasks[selectedDay].length} Completed</span>
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
              <h3>Active Quests</h3>
              <ul>
                {tasks[selectedDay].length === 0 ? (
                  <li>No active quests for {selectedDay}</li>
                ) : (
                  tasks[selectedDay].map((task, i) => (
                    <li key={i}>
                      <span>{task}</span>
                      <button onClick={() => handleCompleteTask(i)}>✓</button>
                      <button onClick={() => handleDeleteTask(i)}>✕</button>
                    </li>
                  ))
                )}
              </ul>
            </div>
            {completedTasks[selectedDay].length > 0 && (
              <div className="quest-section">
                <h3>Completed Quests</h3>
                <ul>
                  {completedTasks[selectedDay].map((task, i) => (
                    <li key={i}>
                      <span>{task}</span>
                      <button onClick={() => handleUncompleteTask(i)}>↶</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right panel: User/Enemy */}
          <div className="right-panels">
            <div className="user-panel">
              <div className="character-header">
                <h2>Your Character</h2>
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
                  <span>{xp} / {xpToNextLevel}</span>
                </div>
              </div>
            </div>

            <div className="enemy-panel">
              <div className="character-header">
                <h2>Enemy Encounter</h2>
              </div>
              <div className="character-avatar">
                <img src={enemyImage} alt="Enemy" className="avatar-img" />
              </div>
              <h3>{enemyName}</h3>
              <div className="character-bars">
                <div className="stat-bar">
                  <label>Health</label>
                  <div className="bar-container">
                    <div className="bar hp-bar">
                      <div className="bar-fill hp-fill" style={{ width: `${(enemyHp / maxEnemyHp) * 100}%` }}></div>
                    </div>
                  </div>
                  <span>{enemyHp} / {maxEnemyHp}</span>
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
