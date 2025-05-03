import React, { useEffect, useState } from "react";
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
import { exportToExcel } from "../lib/utils";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { season, year, availableSemesters, setCurrentSemester, refreshAvailableSemesters } = useSemester();
  const [candidatesStatus, setCandidatesStatus] = useState(false);
  const [assignmentsStatus, setAssignmentsStatus] = useState(false);
  const [shouldFlash, setShouldFlash] = useState(false);

  useEffect(() => {
    const checkUploadStatus = async () => {
      if (!season || !year) return;
      try {
        const semester = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
        const [candidatesRes, assignmentsRes, professorsRes] = await Promise.all([
          fetch(`http://localhost:5002/api/candidates?semester=${semester}`),
          fetch(`http://localhost:5002/api/assignments?semester=${semester}`),
          fetch(`http://localhost:5002/api/professors?semester=${semester}`)
        ]);
        if (!candidatesRes.ok || !assignmentsRes.ok || !professorsRes.ok) {
          console.error('Error fetching status:', await candidatesRes.text(), await assignmentsRes.text(), await professorsRes.text());
          return;
        }
        const [candidatesData, assignmentsData, professorsData] = await Promise.all([
          candidatesRes.json(),
          assignmentsRes.json(),
          professorsRes.json()
        ]);
        const hasCandidates = Array.isArray(candidatesData) && candidatesData.length > 0;
        const hasAssignments = Array.isArray(assignmentsData) && assignmentsData.length > 0;
        const hasProfessors = Array.isArray(professorsData) && professorsData.length > 0;
        setCandidatesStatus(hasCandidates);
        setAssignmentsStatus(hasAssignments);
        setShouldFlash(hasCandidates && hasAssignments && !hasProfessors);
      } catch (error) {
        console.error('Error checking upload status:', error);
      }
    };
    checkUploadStatus();
  }, [season, year]);

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

  const handleAutoAssignAll = async () => {
    if (!season || !year) return;
    const semester = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
    try {
      // Get the import preference from localStorage
      const importPreviousGraders = JSON.parse(localStorage.getItem(`importPreviousGraders_${semester}`) || 'false');
      
      const res = await fetch("http://localhost:5002/api/assignments/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          semester,
          importPreviousGraders 
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to auto-assign all candidates');
      }
      alert(`Successfully created ${data.assignments.length} assignments`);
      setShouldFlash(false);
      // Optionally, refresh status here
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to auto-assign all candidates");
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 items-stretch">
        <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
          <h2 className="text-lg font-semibold mb-2">Export Data</h2>
          <p className="text-gray-600 mb-4">Download Excel sheets for key views</p>
          <div className="space-y-2">
            <Button
              onClick={async () => {
                // Fetch course recommendations data from backend
                const semester = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
                const response = await fetch(`http://localhost:5002/api/professors?semester=${semester}`);
                const data = await response.json();
                exportToExcel({
                  data: data.map((item: {
                    professorName: string;
                    courseNumber: string;
                    section: string;
                    assignedCandidate: string;
                    recommendedCandidate: string;
                    reason: string;
                  }) => ({
                    professorName: item.professorName,
                    courseNumber: item.courseNumber,
                    section: item.section,
                    assignedCandidate: item.assignedCandidate,
                    recommendedCandidate: item.recommendedCandidate,
                    reason: item.reason
                  })),
                  fileName: `professor_recommendations_${semester.replace(/\s+/g, '_').toLowerCase()}`,
                  sheetName: 'Recommendations'
                });
              }}
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
            >
              Export Course Recommendations
            </Button>
            <Button
              onClick={async () => {
                // Fetch assignments data from backend
                const semester = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
                const response = await fetch(`http://localhost:5002/api/assignments?semester=${semester}`);
                const data = await response.json();
                exportToExcel({
                  data: data.map((a: {
                    section: {
                      course_name: string;
                      section_num: string;
                      num_required_graders: number;
                      instructor: { name: string };
                    };
                    assignedCandidate?: { name: string };
                  }) => ({
                    courseSection: `${a.section.course_name}.${a.section.section_num}`,
                    numGraders: a.section.num_required_graders,
                    professorName: a.section.instructor.name,
                    assignedCandidate: a.assignedCandidate?.name || 'Not Assigned',
                  })),
                  fileName: `assignments_${semester.replace(/\s+/g, '_').toLowerCase()}`,
                  sheetName: 'Assignments'
                });
              }}
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
            >
              Export Assigned Candidates
            </Button>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
          <h2 className="text-lg font-semibold mb-2">Start Assignment</h2>
          <p className="text-gray-600 mb-4">Begin the grader assignment process</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${candidatesStatus ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">
                  {candidatesStatus ? 'Candidates uploaded' : 'Candidates pending'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${assignmentsStatus ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">
                  {assignmentsStatus ? 'Sections uploaded' : 'Sections pending'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${season && year ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">
                  {season && year ? 'Semester selected' : 'No semester selected'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleAutoAssignAll}
                variant="outline"
                className={`w-full justify-start hover:bg-orange-50 ${shouldFlash ? 'animate-pulse bg-orange-100' : ''}`}
                disabled={!season || !year || !shouldFlash}
              >
                Start Assignment
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col justify-between h-full">
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
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-orange-50"
              onClick={() => window.open('https://github.com/cs4485-s25-alagar-t7/gas', '_blank')}
            >
              Contact Us
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
