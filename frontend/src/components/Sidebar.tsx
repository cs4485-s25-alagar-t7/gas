import React from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        onLogout();
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              onClick={() => handleClick("/AssignmentsPage")}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-md"
            >
              Assignment
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
              Course Recommendation
            </button>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="mt-6 py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-md"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
