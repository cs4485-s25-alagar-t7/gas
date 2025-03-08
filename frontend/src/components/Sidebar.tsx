import React from "react";
import { useNavigate } from "react-router-dom";
import '../output.css';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-56 bg-[#514C4C] text-white p-6 flex flex-col h-screen z-50">
      <h2 className="text-xl font-bold">Grader System</h2>
      <nav className="mt-6 flex-1">
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => navigate("/")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/candidates")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              View Candidates
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/settings")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Settings
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/tools")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Tools
            </button>
          </li>
        </ul>
      </nav>
      <button
        onClick={() => alert("Logging out...")} // Placeholder for logout logic
        className="mt-6 py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-md"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
