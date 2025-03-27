import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
import ProfessorsPage from "./components/ProfessorsPage";
import CoursesPage from "./components/CoursesPage";
import Upload from "./components/Upload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/CandidatesPage" element={<CandidatePage />} />
        <Route path="/ProfessorsPage" element={<ProfessorsPage />} />
        <Route path="/CoursesPage" element={<CoursesPage />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
