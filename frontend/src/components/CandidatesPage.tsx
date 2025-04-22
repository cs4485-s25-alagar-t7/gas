import React, { useEffect, useState } from "react";

interface Candidate {
  _id: string;
  name: string;
  netid: string;
  gpa: number;
  major: string;
  resume_keywords?: string[];
  resume?: string;
  assignmentStatus: boolean;
  seniority: string;
  course: {
    _id: string;
    course_name: string;
    section_num: string;
    instructor: {
      name: string;
      email: string;
    };
    num_required_graders: number;
  } | null;
}

const ITEMS_PER_PAGE = 5;

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "netid" | "course_id" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [currentSemester, setCurrentSemester] = useState("spring 2024");

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching candidates...");
      const response = await fetch(`http://localhost:5001/api/candidates?semester=${currentSemester}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error (${response.status}): ${errorText || 'No error details available'}`);
      }
      
      const text = await response.text();
      console.log("Raw response:", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        console.log("Raw text received:", text);
        setError("Failed to parse server response. Check browser console for details.");
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error("Received data is not an array:", data);
        setError("Invalid data format received from server");
        return;
      }
      
      console.log("Parsed data:", data);
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch candidates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("CandidatesPage mounted");
    fetchCandidates();
  }, [currentSemester]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/candidates/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setCandidates(prev => prev.filter(c => c._id !== id));
      alert("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (field: "name" | "netid" | "course_id") => {
    setSortField(field);
  };

  const handleAddCandidate = () => {
    setIsAddCandidateModalOpen(true);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleAddCandidateSubmit = async () => {
    if (!resumeFile) {
      alert("Please upload a resume.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch("http://localhost:5001/api/candidates/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert("Candidate added successfully!");
      setIsAddCandidateModalOpen(false);
      setResumeFile(null);
      fetchCandidates(); // Refresh the candidates list
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to add candidate. Please try again.");
    }
  };

  const filteredCandidates = candidates
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchQuery) ||
      candidate.netid.toLowerCase().includes(searchQuery) ||
      candidate.course?.course_name?.toLowerCase().includes(searchQuery) ||
      candidate.course?.instructor?.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aField = sortField === "course_id" ? a.course?.course_name || "" : a[sortField];
      const bField = sortField === "course_id" ? b.course?.course_name || "" : b[sortField];
      return aField.localeCompare(bField);
    });

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayedCandidates = showAll ? filteredCandidates : paginatedCandidates;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Candidate View</h1>
            <div className="flex items-center space-x-4">
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                className="border px-4 py-2 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none"
              >
                <option value="spring 2024">Spring 2024</option>
                <option value="fall 2024">Fall 2024</option>
                <option value="spring 2025">Spring 2025</option>
              </select>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <button onClick={() => handleSort("name")} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Sort by Name</button>
              <button onClick={() => handleSort("netid")} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Sort by NetID</button>
              <button onClick={() => handleSort("course_id")} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Sort by Course</button>
              <button
                onClick={handleAddCandidate}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Add Candidate
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading candidates...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-600">No candidates found</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200">
                  <tr className="text-left">
                    <th className="p-4">Assignment Status</th>
                    <th className="p-4">Candidate Name</th>
                    <th className="p-4">Course & Section</th>
                    <th className="p-4">Professor Name</th>
                    <th className="p-4">Remove Candidate</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCandidates.map((candidate) => (
                    <tr key={candidate._id} className="border-t">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded ${candidate.assignmentStatus ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {candidate.assignmentStatus ? "Assigned" : "Unassigned"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          {candidate.name}
                        </button>
                        <div className="text-xs text-gray-500">NetID: {candidate.netid}</div>
                      </td>
                      <td className="p-4">
                        {candidate.course
                          ? `${candidate.course.course_name || "N/A"}.${candidate.course.section_num || "N/A"}`
                          : "Not Assigned"}
                      </td>
                      <td className="p-4">{candidate.course?.instructor?.name || "Not Assigned"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to remove this candidate?")) {
                              handleDelete(candidate._id);
                            }
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Remove Candidate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls + Show All Toggle */}
          <div className="flex justify-between items-center mt-4">
            {!showAll && (
              <div className="flex space-x-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">First</button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Previous</button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Last</button>
              </div>
            )}
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="px-4 py-2 rounded-lg bg-orange-400 text-white hover:bg-orange-500"
            >
              {showAll ? "Show Paginated" : "Show All"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddCandidateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Resumes (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeChange}
            className="mb-4"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel Sheet</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            // Handle Excel file upload logic here
            console.log("Excel file selected:", e.target.files[0]);
          }
            }}
            className="mb-4"
          />
        </div>
        <button
          onClick={handleAddCandidateSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Submit
        </button>
        <button
          onClick={() => setIsAddCandidateModalOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
          </div>
        </div>
      )}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-2">{selectedCandidate.name}</h2>
            <p className="text-sm text-gray-600 mb-2">NetID: {selectedCandidate.netid}</p>
            <p className="text-sm text-gray-600 mb-2">Major: {selectedCandidate.major}</p>
            <p className="text-sm text-gray-600 mb-2">GPA: {selectedCandidate.gpa}</p>
            <p className="text-sm text-gray-600 mb-2">Seniority: {selectedCandidate.seniority}</p>
            {selectedCandidate.resume && (
              <a
                href={selectedCandidate.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mb-2 block"
              >
                View Resume
              </a>
            )}
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;
