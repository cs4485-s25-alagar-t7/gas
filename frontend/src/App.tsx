import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
import ProfessorsPage from "./components/ProfessorsPage";
import AssignmentsPage from "./components/AssignmentsPage";
import CreateSemester from "./components/CreateSemester";
import AdminLoginModal from "./components/AdminLoginModel";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("adminLoggedIn");
    setIsAuthenticated(auth === "true");
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      {!isAuthenticated && (
        <AdminLoginModal onLogin={() => setIsAuthenticated(true)} />
      )}
      {isAuthenticated && (
        <Routes>
          <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
          <Route
            path="/CandidatesPage"
            element={<CandidatePage onLogout={handleLogout} />}
          />
          <Route
            path="/ProfessorsPage"
            element={<ProfessorsPage onLogout={handleLogout} />}
          />
          <Route
            path="/AssignmentsPage"
            element={<AssignmentsPage onLogout={handleLogout} />}
          />
          <Route
            path="/create-semester"
            element={<CreateSemester onLogout={handleLogout} />}
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
