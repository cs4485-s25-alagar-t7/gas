import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../@/components/ui/card";
import { useSemester } from "../context/SemesterContext";
import { Button } from "../../@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../@/components/ui/select";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { season, year, availableSemesters, setCurrentSemester, refreshAvailableSemesters } = useSemester();

  const handleResetSemester = async () => {
    if (window.confirm(`Are you sure you want to reset the data for ${season} ${year}? This action cannot be undone.`)) {
      try {
        const semesterString = `${season} ${year}`;
        const res = await fetch(`http://localhost:5002/api/candidates/delete-all?semester=${encodeURIComponent(semesterString)}`, {
          method: "DELETE"
        });
        const data = await res.json();
        alert(data.message || "Semester data deleted.");
        refreshAvailableSemesters();
        setCurrentSemester("");
      } catch (e) {
        alert("Failed to reset semester data.");
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Card className="p-8 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-orange-600 font-extrabold text-4xl">
                UT<span className="text-black">DALLAS</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 border-l-2 border-gray-300 pl-6">
                Welcome Back!
              </h1>
            </div>
            <Button
              onClick={() => navigate("/create-semester")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
            >
              Create New Semester
            </Button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                Current Semester:
              </span>
              <Select
                value={season && year ? `${season} ${year}` : "none"}
                onValueChange={(value) => setCurrentSemester(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-[240px] bg-white border-gray-200 shadow-sm">
                  <SelectValue>
                    {season && year ? `${season} ${year}` : "No Semester Selected"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border border-gray-200 shadow-md min-w-[240px] [&_svg]:hidden"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectGroup>
                    <SelectLabel className="text-orange-600 font-semibold px-2 py-1.5 text-sm">
                      Available Semesters
                    </SelectLabel>
                    <SelectItem 
                      value="none" 
                      className="text-gray-500 hover:bg-orange-50 cursor-pointer px-2 py-1.5 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-900 transition-colors"
                    >
                      No Semester Selected
                    </SelectItem>
                    {availableSemesters
                      .filter(s => s.trim() !== '')
                      .sort((a, b) => b.localeCompare(a))
                      .map(s => (
                        <SelectItem 
                          key={s} 
                          value={s}
                          className="hover:bg-orange-50 cursor-pointer text-gray-900 px-2 py-1.5 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-900 transition-colors"
                        >
                          {s}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {availableSemesters.length > 0 && season && year && (
              <Button
                onClick={handleResetSemester}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                Reset Semester Data
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <p className="text-gray-600 mb-4">Common tasks and operations</p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/assignments")}
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
            >
              View Assignments
            </Button>
            <Button
              onClick={() => navigate("/candidates")}
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
            >
              Manage Candidates
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          <p className="text-gray-600 mb-4">Current system information</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span>System Status</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span>Current Session</span>
              <span className="text-blue-600">Connected</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold mb-2">Help & Resources</h2>
          <p className="text-gray-600 mb-4">Documentation and support</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
              onClick={() => window.open('https://github.com/cs4485-s25-alagar-t7/gas', '_blank')}
            >
              View Documentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
