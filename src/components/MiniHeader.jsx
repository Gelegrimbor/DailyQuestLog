// src/components/MiniHeader.jsx
import { useNavigate } from "react-router-dom";

export default function MiniHeader() {
  const navigate = useNavigate();

  return (
    <div className="mini-header" onClick={() => navigate("/")}>
      <div className="brand-icon">⚔️</div>
      <h1 className="brand-title">QuestLog</h1>
    </div>
  );
}
