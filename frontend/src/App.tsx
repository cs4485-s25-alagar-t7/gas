import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
import ProfessorsPage from "./components/ProfessorsPage";
import AssignmentsPage from "./components/AssignmentsPage";
import CreateSemester from "./components/CreateSemester";
import Login from "./components/Login";
import Layout from "./components/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    // Don't check auth if we're on the login page
    if (window.location.pathname === '/login') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/check-auth', {
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

  useEffect(() => {
    // Add a small delay before checking auth
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  // If we're on the login page and auth status is unknown, assume not authenticated
  if (window.location.pathname === '/login' && isAuthenticated === null) {
    setIsAuthenticated(false);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/CandidatesPage"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <CandidatePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/ProfessorsPage"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ProfessorsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/AssignmentsPage"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AssignmentsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/create-semester"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <CreateSemester />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
