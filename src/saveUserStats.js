import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; // adjust the path if needed

export const saveUserStats = async (uid, stats) => {
    try {
        const statsRef = doc(db, "users", uid, "stats", "current");
        await setDoc(statsRef, stats);
        console.log("✅ Stats saved successfully:", stats);
    } catch (error) {
        console.error("❌ Error saving stats:", error);
    }
};
