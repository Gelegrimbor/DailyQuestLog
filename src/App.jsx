import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SetUsername from "./pages/SetUsername";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import "./styles/app.css";

function App() {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show Header on login/signup/set-username
  const hideHeader = ["/login", "/signup", "/set-username"].includes(location.pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/set-username"
          element={<PrivateRoute><SetUsername /></PrivateRoute>}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              {user?.email === "admin@questlog.com" ? <Admin /> : <p>Not authorized.</p>}
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
