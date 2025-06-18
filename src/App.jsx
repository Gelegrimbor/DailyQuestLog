import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SetUsername from "./pages/SetUsername";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Only new users go here once after signup */}
      <Route
        path="/set-username"
        element={
          <PrivateRoute>
            <SetUsername />
          </PrivateRoute>
        }
      />

      {/* Authenticated users only */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Only admin email can access */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            {user?.email === "admin@questlog.com" ? (
              <Admin />
            ) : (
              <p>Not authorized.</p>
            )}
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
