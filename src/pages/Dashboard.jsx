import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <div className="dashboard-container">
      <h1>Welcome back, {userData?.username || "Adventurer"}!</h1>
      <p>🔥 XP: {userData?.xp ?? 0}</p>
      <p>🎯 Ready for your next quest?</p>
    </div>
  );
}
