import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { SemesterProvider } from "./context/SemesterContext";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CandidatesPage from "./components/CandidatesPage";
import AssignmentsPage from "./components/AssignmentsPage";
import ProfessorsPage from "./components/ProfessorsPage";
import CreateSemester from "./components/CreateSemester";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    if (window.location.pathname === '/login') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/api/auth/check-auth', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      setIsAuthenticated(!!data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5002/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (window.location.pathname === '/login' && isAuthenticated === null) {
    setIsAuthenticated(false);
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SemesterProvider>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              element={
                isAuthenticated ? (
                  <Layout onLogout={handleLogout}>
                    <Outlet />
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="professors" element={<ProfessorsPage />} />
              <Route path="create-semester" element={<CreateSemester />} />
            </Route>
          </Routes>
        </SemesterProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
