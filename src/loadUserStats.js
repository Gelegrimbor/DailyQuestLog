// loadUserStats.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const loadUserStats = async (uid) => {
    try {
        const statsRef = doc(db, "users", uid, "stats", "current");
        const docSnap = await getDoc(statsRef);
        if (docSnap.exists()) {
            console.log("📥 Stats loaded:", docSnap.data());
            return docSnap.data();
        } else {
            console.log("❌ No stats found for user");
            return null;
        }
    } catch (error) {
        console.error("❌ Error loading stats:", error);
        return null;
    }
};