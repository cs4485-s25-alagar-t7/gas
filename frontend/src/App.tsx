import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CandidatePage from "./components/CandidatesPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates" element={<CandidatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
