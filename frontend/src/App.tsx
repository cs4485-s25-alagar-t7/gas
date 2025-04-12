import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
import CoursesPage from "./components/CoursesPage";
import AssignmentsPage from "./components/AssignmentsPage";
import Upload from "./components/Upload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/CandidatesPage" element={<CandidatePage />} />
        <Route path="/CoursesPage" element={<CoursesPage />} />
        <Route path="/AssignmentsPage" element={<AssignmentsPage />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
