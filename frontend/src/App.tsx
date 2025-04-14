import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
import ProfessorsPage from "./components/ProfessorsPage";
import AssignmentsPage from "./components/AssignmentsPage";
import CreateSemester from "./components/CreateSemester";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/CandidatesPage" element={<CandidatePage />} />
        <Route path="/ProfessorsPage" element={<ProfessorsPage />} />
        <Route path="/AssignmentsPage" element={<AssignmentsPage />} />
        <Route path="/create-semester" element={<CreateSemester />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
