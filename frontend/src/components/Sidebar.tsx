import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    console.log(`Navigating to ${path}`);
    navigate(path);
  };

  return (
    <aside className="w-56 bg-[#514C4C] text-white p-6 flex flex-col h-screen z-50">
      <h2 className="text-xl font-bold">Grader System</h2>
      <nav className="mt-6 flex-1">
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => handleClick("/")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("/CandidatesPage")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Candidate
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("/ProfessorsPage")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Professor
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("/AssignmentsPage")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Assignment
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("/upload")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Upload
            </button>
          </li>
        </ul>
      </nav>
      <button
        onClick={() => {
          console.log("Logging out...");
          alert("Logging out...");
        }} // Placeholder for logout logic
        className="mt-6 py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-md"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
