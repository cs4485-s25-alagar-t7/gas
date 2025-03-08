import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatesPage from "./components/CandidatesPage";
// import Settings from "./components/Settings";
// import Tools from "./components/Tools";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        {/* <Route path="/settings" element={<Settings />} />
        <Route path="/tools" element={<Tools />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
