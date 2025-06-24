import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export default function Header() {
  const navigate = useNavigate();
  return (
    <button className="home-btn" onClick={() => navigate("/")}>
      <FiHome size={22} />
    </button>
  );
}
