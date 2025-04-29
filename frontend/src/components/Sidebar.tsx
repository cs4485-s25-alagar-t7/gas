import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  School,
  LogOut 
} from "lucide-react";

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
      const response = await fetch('http://localhost:5002/api/auth/logout', {
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
    <Card className="w-64 h-screen bg-[#514C4C] text-white border-none rounded-none">
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-8">Grader System</h2>
        <nav className="flex-1">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 flex items-center pl-1"
              onClick={() => handleClick("/")}
            >
              <LayoutDashboard className="mr-2 h-5 w-5 flex-shrink-0" />
              Dashboard
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 flex items-center pl-1"
              onClick={() => handleClick("/assignments")}
            >
              <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
              Assignment
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 flex items-center pl-1"
              onClick={() => handleClick("/candidates")}
            >
              <Users className="mr-2 h-5 w-5 flex-shrink-0" />
              Candidate
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10 whitespace-nowrap flex items-center pl-1"
              onClick={() => handleClick("/professors")}
            >
              <School className="mr-2 h-5 w-5 flex-shrink-0" />
              Course Recommendation
            </Button>
          </div>
        </nav>
        
        <Button
          variant="ghost"
          className="mt-6 w-full justify-start text-white hover:bg-white/10 hover:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </Card>
  );
};

export default Sidebar;
