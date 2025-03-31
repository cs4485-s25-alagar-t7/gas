import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const candidates = [
  { candidateID: "jxc210000", name: "Jane Cooper", courseNumber: "CS1337", professorName: "Srimathi Srinavasan", className: "Computer Science I" },
  { candidateID: "fxm210000", name: "Floyd Miles", courseNumber: "CS2305", professorName: "James Wilson", className: "Discrete Math I" },
  { candidateID: "rxr210000", name: "Ronald Richards", courseNumber: "CS2337", professorName: "Doug Degroot", className: "Computer Science II" },
  { candidateID: "mxm210000", name: "Marvin McKinney", courseNumber: "CS2340", professorName: "John Cole", className: "Computer Architecture" },
  { candidateID: "jxb210000", name: "Jerome Bell", courseNumber: "CS2336", professorName: "Arnold Gordon", className: "Computer Science II" },
  { candidateID: "kxm210000", name: "Kathryn Murphy", courseNumber: "CS1436", professorName: "Brian Ricks", className: "Programming Fundamentals" },
  { candidateID: "jxj210000", name: "Jacob Jones", courseNumber: "CS3354", professorName: "Mark Paulk", className: "Software Engineering" },
  { candidateID: "kxw210000", name: "Kristin Watson", courseNumber: "CS3377", professorName: "Karami Gity", className: "Systems Programming in UNIX" },
];

const ITEMS_PER_PAGE = 5;

const CandidatePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "courseNumber" | "professorName" | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSort = (field: "name" | "courseNumber" | "professorName") => {
    setSortField(field);
  };

  const filteredCandidates = candidates
    .filter((candidate) =>
      candidate.name.toLowerCase().includes(searchQuery) ||
      candidate.courseNumber.toLowerCase().includes(searchQuery) ||
      candidate.professorName.toLowerCase().includes(searchQuery) ||
      candidate.className.toLowerCase().includes(searchQuery) ||
      candidate.candidateID.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      return a[sortField].localeCompare(b[sortField]);
    });

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <h1 className="text-2xl font-semibold text-gray-800">Candidate View</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search Candidates"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <div className="relative">
                <button
                  onClick={() => handleSort("name")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Candidate Name
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
              <div className="relative">
                <button
                  onClick={() => handleSort("professorName")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Professor Name
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Candidate ID</th>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Course Number</th>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCandidates.map((candidate, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{candidate.candidateID}</td>
                    <td className="p-4">{candidate.name}</td>
                    <td className="p-4">{candidate.courseNumber}</td>
                    <td className="p-4">{candidate.professorName}</td>
                    <td className="p-4">{candidate.className}</td>
                    <td className="p-4 flex gap-2">
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg ${currentPage === 1 ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg ${currentPage === 1 ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;