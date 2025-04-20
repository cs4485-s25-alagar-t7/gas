import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface Candidate {
  _id: string;
  name: string;
  netid: string;
  gpa: number;
  major: string;
  resume_keywords?: string[];
  resume?: string;
  assignmentStatus: boolean;
  course: {
    course_id: string;
    section_id: string;
    instructor: {
      name: string;
      email: string;
    };
    course_name?: string;
  } | null;
}

const ITEMS_PER_PAGE = 5;

const CandidatePage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "netid" | "course_id" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/candidates")
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setCandidates(data);
        } catch {
          console.error("Failed to parse JSON from /api/candidates. Raw response:", text);
        }
      })
      .catch(error => {
        console.error("Network error fetching candidates:", error);
      });
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/candidates/${id}`, { method: "DELETE" });
    setCandidates(prev => prev.filter(c => c._id !== id));
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

  const handleAddCandidateSubmit = () => {
    if (resumeFile) {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      fetch("/api/candidates/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            alert("Candidate added successfully!");
            setIsAddCandidateModalOpen(false);
            setResumeFile(null);
          } else {
            alert("Failed to add candidate.");
          }
        })
        .catch((error) => {
          console.error("Error uploading resume:", error);
          alert("An error occurred while adding the candidate.");
        });
    } else {
      alert("Please upload a resume.");
    }
  };

  const filteredCandidates = candidates
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchQuery) ||
      candidate.netid.toLowerCase().includes(searchQuery) ||
      candidate.course?.course_id?.toLowerCase().includes(searchQuery) ||
      candidate.course?.instructor?.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      const aField = sortField === "course_id" ? a.course?.course_id || "" : a[sortField];
      const bField = sortField === "course_id" ? b.course?.course_id || "" : b[sortField];
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
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Candidate View</h1>
            <div className="flex items-center space-x-4">
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
                    <td className="p-4">{candidate.assignmentStatus ? "True" : "False"}</td>
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
                        ? `${candidate.course.course_id || "N/A"}.${candidate.course.section_id || "N/A"}`
                        : "N/A"}
                    </td>
                    <td className="p-4">{candidate.course?.instructor?.name || "N/A"}</td>
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

export default CandidatePage;
