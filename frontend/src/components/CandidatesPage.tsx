import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface Candidate {
  _id: string;
  name: string;
  netid: string;
  assignmentStatus: boolean;
  course: {
    course_id: string;
    section_id: string;
    instructor: {
      name: string;
      email: string;
    };
    course_name?: string; // optional for future
  } | null;
}

const ITEMS_PER_PAGE = 5;

const CandidatePage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "netid" | "course_id" | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/candidates")
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          console.log("Candidates received:", data);
          setCandidates(data);
        } catch (err) {
          console.error("Failed to parse JSON from /api/candidates. Raw response:");
          console.error(text); // show what your backend returned
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
  };

  const handleSort = (field: "name" | "netid" | "course_id") => {
    setSortField(field);
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
              <button
                onClick={() => handleSort("name")}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sort by Name
              </button>
              <button
                onClick={() => handleSort("netid")}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sort by NetID
              </button>
              <button
                onClick={() => handleSort("course_id")}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sort by Course
              </button>
            </div>
          </div>

          {/* Candidate Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Assignment Status</th>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Course Number</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Remove</th>
                </tr>
              </thead>
              <tbody>
                {currentCandidates.map((candidate) => (
                  <tr key={candidate._id} className="border-t">
                    <td className="p-4">{candidate.assignmentStatus ? "True" : "False"}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-600">{candidate.name}</span>
                        <span className="text-xs text-gray-500">NetID: {candidate.netid}</span>
                      </div>
                    </td>
                    <td className="p-4">{candidate.course?.course_id || "N/A"}</td>
                    <td className="p-4">{candidate.course?.section_id || "N/A"}</td>
                    <td className="p-4">{candidate.course?.instructor?.name || "N/A"}</td>
                    <td className="p-4">{candidate.course?.course_name || "N/A"}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(candidate._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
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
