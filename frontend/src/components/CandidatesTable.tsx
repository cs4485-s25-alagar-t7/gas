import React, { useState } from "react";
import '../output.css';

const initialCandidates = [
  { name: "Jane Cooper", school: "ECS", phone: "(225) 555-0118", email: "EMAIL@UTDALLAS.EDU", gpa: "4.00", status: "Active" },
  { name: "Floyd Miles", school: "ECS", phone: "(205) 555-0100", email: "EMAIL@UTDALLAS.EDU", gpa: "2.43", status: "Denied" },
  { name: "Ronald Richards", school: "ECS", phone: "(302) 555-0107", email: "EMAIL@UTDALLAS.EDU", gpa: "1.92", status: "Denied" },
  { name: "Marvin McKinney", school: "JSOM", phone: "(252) 555-0216", email: "EMAIL@UTDALLAS.EDU", gpa: "3.92", status: "Active" },
  { name: "Jerome Bell", school: "ECS", phone: "(629) 555-0129", email: "EMAIL@UTDALLAS.EDU", gpa: "3.82", status: "Active" },
  { name: "Kathryn Murphy", school: "NSC", phone: "(406) 555-0120", email: "EMAIL@UTDALLAS.EDU", gpa: "4.00", status: "Active" },
  { name: "Jacob Jones", school: "ECS", phone: "(208) 555-0112", email: "EMAIL@UTDALLAS.EDU", gpa: "3.56", status: "Active" },
  { name: "Kristin Watson", school: "JSOM", phone: "(704) 555-0127", email: "EMAIL@UTDALLAS.EDU", gpa: "2.89", status: "Denied" },
];

const CandidatesTable = () => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setCandidates(initialCandidates);
    } else {
      const filtered = initialCandidates.filter(candidate => 
        candidate.name.toLowerCase().includes(term) ||
        candidate.school.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.status.toLowerCase().includes(term)
      );
      setCandidates(filtered);
    }
  };
  
  // Handle sorting
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    
    const sortedData = [...candidates].sort((a, b) => {
      if (field === "gpa") {
        return newDirection === "asc" 
          ? parseFloat(a[field]) - parseFloat(b[field])
          : parseFloat(b[field]) - parseFloat(a[field]);
      } else {
        return newDirection === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
    });
    
    setCandidates(sortedData);
  };
  
  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* Header: Title + Search + Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Candidates</h2>
          <p className="text-gray-500 text-sm mt-1">
            Total: {candidates.length} | Active: {candidates.filter(c => c.status === "Active").length} | Denied: {candidates.filter(c => c.status === "Denied").length}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search candidates..."
              className="border border-gray-300 p-2 pl-10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none w-64 transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-all text-sm font-medium">
              Export
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all text-sm font-medium">
              Add New
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Filter:</span>
        </div>
        {["ECS", "JSOM", "NSC"].map(school => (
          <div 
            key={school}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-gray-200 transition-all"
          >
            {school}
          </div>
        ))}
        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-all">
          Active
        </div>
        <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-red-200 transition-all">
          Denied
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm uppercase">
              <th className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-all" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Candidate Name
                  <span className="ml-1">{renderSortIndicator("name")}</span>
                </div>
              </th>
              <th className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-all" onClick={() => handleSort("school")}>
                <div className="flex items-center">
                  School
                  <span className="ml-1">{renderSortIndicator("school")}</span>
                </div>
              </th>
              <th className="py-3 px-4 text-left font-semibold">Phone Number</th>
              <th className="py-3 px-4 text-left font-semibold">Email</th>
              <th className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-all" onClick={() => handleSort("gpa")}>
                <div className="flex items-center">
                  GPA
                  <span className="ml-1">{renderSortIndicator("gpa")}</span>
                </div>
              </th>
              <th className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-gray-100 transition-all" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  Status
                  <span className="ml-1">{renderSortIndicator("status")}</span>
                </div>
              </th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-200 text-gray-800 hover:bg-gray-50 transition-all"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-3">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{candidate.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{candidate.school}</td>
                  <td className="py-3 px-4">{candidate.phone}</td>
                  <td className="py-3 px-4 text-blue-600">{candidate.email.toLowerCase()}</td>
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center">
                      {parseFloat(candidate.gpa) >= 3.5 ? (
                        <span className="text-green-500 mr-1">★</span>
                      ) : parseFloat(candidate.gpa) < 2.5 ? (
                        <span className="text-red-500 mr-1">●</span>
                      ) : null}
                      {candidate.gpa}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        candidate.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="text-gray-500 hover:text-blue-600" title="View Details">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="text-gray-500 hover:text-green-600" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500">
                  No candidates found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {candidates.length} of {initialCandidates.length} candidates
        </div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 rounded border border-gray-300 text-sm bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 bg-blue-600 text-white text-sm">
            1
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 text-sm bg-white hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 text-sm bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidatesTable;