import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const professorData = [
  { profName: "Sridhar Alagar", courseNumber: "CS1337", className: "Computer Science I", section: "001", assignedCandidate: "Jane Cooper", recommendedCandidate: "Jane Cooper", reasonForMismatch: "" },
  { profName: "Eric Becker", courseNumber: "CS2305", className: "Discrete Math I", section: "501", assignedCandidate: "Floyd Miles", recommendedCandidate: "Floyd Miles", reasonForMismatch: "" },
  { profName: "Eric Becker", courseNumber: "CS2305", className: "Discrete Math I", section: "502", assignedCandidate: "Floyd Miles", recommendedCandidate: "Thenn Malligarjunan", reasonForMismatch: "Not in candidate pool" },
  { profName: "Omar Hamdy", courseNumber: "CS2337", className: "Computer Science II", section: "003", assignedCandidate: "Ronald Richards", recommendedCandidate: "Ronald Richards", reasonForMismatch: "" },
  { profName: "John Cole", courseNumber: "CS2340", className: "Computer Architecture", section: "005", assignedCandidate: "Marvin McKinney", recommendedCandidate: "Marvin McKinney", reasonForMismatch: "" },
  { profName: "Neeraj Gupta", courseNumber: "CS2336", className: "Computer Science II", section: "007", assignedCandidate: "Jerome Bell", recommendedCandidate: "Floyd Miles", reasonForMismatch: "Assigned to another course" },
  { profName: "Gopal Gupta", courseNumber: "CS1436", className: "Programming Fundamentals", section: "506", assignedCandidate: "Kathryn Murphy", recommendedCandidate: "Kathryn Murphy", reasonForMismatch: "" },
  { profName: "Emily Fox", courseNumber: "CS3354", className: "Software Engineering", section: "504", assignedCandidate: "Jacob Jones", recommendedCandidate: "Thenn Malligarjunan", reasonForMismatch: "Not in candidate pool" },
  { profName: "Chris Davis", courseNumber: "CS3377", className: "Systems Programming in UNIX", section: "008", assignedCandidate: "Kristin Watson", recommendedCandidate: "Kristin Watson", reasonForMismatch: "" },
];

const ProfessorPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"profName" | "className" | "courseNumber" | "">("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSort = (field: "profName" | "className" | "courseNumber") => {
    setSortField(field);
  };

  const filteredProfessors = professorData
    .filter((professor) =>
      professor.profName.toLowerCase().includes(searchQuery) ||
      professor.courseNumber.toLowerCase().includes(searchQuery) ||
      professor.className.toLowerCase().includes(searchQuery) ||
      professor.assignedCandidate.toLowerCase().includes(searchQuery) ||
      professor.recommendedCandidate.toLowerCase().includes(searchQuery) ||
      professor.reasonForMismatch.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      return a[sortField].localeCompare(b[sortField]);
    });

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />

        {/* Content Area */}
        <div className="p-8">
          {/* Title and Search */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Professor View</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search Professors"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <div className="relative">
                <button
                  onClick={() => handleSort("profName")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Professor Name
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSort("className")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Course Name
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSort("courseNumber")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Course Number
                </button>
              </div>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                All Filters
              </button>
            </div>
          </div>

          {/* Professor Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Course Number</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Assigned Candidate</th>
                  <th className="p-4">Recommended Candidate</th>
                  <th className="p-4">Reason for Mismatch</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((professor, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{professor.profName}</td>
                    <td className="p-4">{professor.className}</td>
                    <td className="p-4">{professor.courseNumber}</td>
                    <td className="p-4">{professor.section}</td>
                    <td className="p-4">{professor.assignedCandidate}</td>
                    <td className="p-4">{professor.recommendedCandidate}</td>
                    <td className="p-4">{professor.reasonForMismatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-4 space-x-2">
            <button className="px-3 py-1 bg-gray-300 rounded-lg">1</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">2</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">3</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">4</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">...</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorPage;