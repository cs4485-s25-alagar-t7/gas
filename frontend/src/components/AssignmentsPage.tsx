import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface Candidate {
  _id: string;
  name: string;
  netid: string;
  gpa: number;
  major: string;
  resume_keywords: string[];
  section?: {
    course_name: string;
    section_num: string;
    instructor: {
      name: string;
      email: string;
    };
  };
}

interface Assignment {
  _id: string;
  section: {
    _id: string;
    course_name: string;
    section_num: string;
    instructor: {
      name: string;
      email: string;
    };
    num_required_graders: number;
  };
  assignedCandidate: {
    name: string;
    netid: string;
  };
}

const ITEMS_PER_PAGE = 5;

const AssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"course" | "instructor" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [currentSemester, setCurrentSemester] = useState("spring 2024");

  const [methodSelector, setMethodSelector] = useState<Assignment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchCandidates();
  }, [currentSemester]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/assignments?semester=${currentSemester}`, {
        method: "GET"
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch assignments: ${errorText}`);
      }
      const data = await response.json();
      console.log('Fetched assignments:', data);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError("Failed to fetch assignments");
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/candidates");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch candidates: ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (field: "course" | "instructor") => setSortField(field);

  const handleAssignReturning = async () => {
    try {
      const res = await fetch("/api/assignments/returning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester: currentSemester })
      });
      if (!res.ok) throw new Error("Failed to assign returning candidates");
      const data = await res.json();
      alert(`${data.count} returning candidates assigned.`);
      fetchAssignments();
    } catch (error) {
      console.error("Error assigning returning candidates:", error);
      alert("Failed to assign returning candidates");
    }
  };

  const handleAutoAssign = async (assignment: Assignment) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/assignments/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: assignment.section._id,
          semester: currentSemester
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to auto-assign candidates");
      }

      const data = await res.json();
      console.log("Auto-assign response:", data);
      
      // Refresh assignments after auto-assign
      fetchAssignments();
    } catch (error) {
      console.error("Error auto-assigning candidates:", error);
      setError("Failed to auto-assign candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssignAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5001/api/assignments/generate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester: currentSemester
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to auto-assign all candidates');
      }

      console.log("Auto-assign all response:", data);
      alert(`Successfully created ${data.assignments.length} assignments`);
      
      // Refresh assignments after auto-assign
      await fetchAssignments();
    } catch (error) {
      console.error("Error auto-assigning all candidates:", error);
      setError(error instanceof Error ? error.message : "Failed to auto-assign all candidates");
      alert(error instanceof Error ? error.message : "Failed to auto-assign all candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (candidate: Candidate) => {
    if (!selectedAssignment) return;
    try {
      const res = await fetch("/api/assignments/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate._id,
          sectionId: selectedAssignment.section._id,
          semester: currentSemester
        })
      });
      if (!res.ok) throw new Error("Failed to assign candidate");
      alert("Candidate assigned successfully");
      closeModal();
      fetchAssignments();
    } catch (error) {
      console.error("Error assigning candidate:", error);
      alert("Failed to assign candidate");
    }
  };

  const filtered = assignments
    .filter(a =>
      `${a.section.course_name}.${a.section.section_num}`.toLowerCase().includes(searchQuery) ||
      a.section.instructor.name.toLowerCase().includes(searchQuery) ||
      a.assignedCandidate.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === "instructor") {
        return a.section.instructor.name.localeCompare(b.section.instructor.name);
      }
      return `${a.section.course_name}.${a.section.section_num}`.localeCompare(`${b.section.course_name}.${b.section.section_num}`);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const displayed = showAll ? filtered : paged;

  const handlePageChange = (page: number) => setCurrentPage(page);

  const openManual = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
    setMethodSelector(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Assignment View</h1>
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
                className="border px-4 py-2 w-64 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <button onClick={() => handleSort("instructor")} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Sort by Professor
              </button>
              <button onClick={() => handleSort("course")} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Sort by Course
              </button>
              {/* <button onClick={handleAssignReturning} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Assign Returning
              </button> */}
              <button onClick={handleAutoAssignAll} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Auto Assign All
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-4">Course & Section</th>
                  <th className="p-4"># of Graders</th>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Assigned Candidate</th>
                  <th className="p-4">Change Assignment</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((a) => (
                  <tr key={a._id} className="border-t">
                    <td className="p-4">{a.section ? `${a.section.course_name}.${a.section.section_num}` : 'N/A'}</td>
                    <td className="p-4">{a.section?.num_required_graders || 'N/A'}</td>
                    <td className="p-4">{a.section?.instructor?.name || 'N/A'}</td>
                    <td className="p-4">{a.assignedCandidate?.name || 'N/A'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setMethodSelector(a)}
                        className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                      >
                        Select Method
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            {!showAll && (
              <div className="flex space-x-2">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">First</button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{i + 1}</button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Last</button>
              </div>
            )}
            <button onClick={() => setShowAll(v => !v)} className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-500">
              {showAll ? "Show Paginated" : "Show All"}
            </button>
          </div>
        </div>
      </div>

      {methodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative max-w-xs w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">Select Method</h2>
            <div className="flex justify-around space-x-4">
              <button onClick={() => openManual(methodSelector)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Manually Change</button>
              <button onClick={() => handleAutoAssign(methodSelector)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Auto Assign</button>
            </div>
            <button onClick={() => setMethodSelector(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>
      )}

      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Assign New Candidate</h2>
            <input type="text" placeholder="Search candidates" value={searchQuery} onChange={e => setSearchQuery(e.target.value.toLowerCase())} className="border rounded px-4 py-2 w-full mb-4 shadow-sm focus:ring focus:ring-orange-400 outline-none" />
            <ul className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {candidates.filter(c =>
                c.name.toLowerCase().includes(searchQuery) ||
                c.netid.toLowerCase().includes(searchQuery) ||
                c.major.toLowerCase().includes(searchQuery)
              ).map(c => {
                const isAssigned = !!c.section;
                return (
                  <li key={c._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.netid}</p>
                      <p className="text-sm text-gray-500">Major: {c.major}</p>
                      <p className="text-sm text-gray-500">GPA: {c.gpa}</p>
                    </div>
                    <button onClick={() => handleAssign(c)} disabled={isAssigned} className={`px-4 py-2 rounded ${isAssigned ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}>Assign</button>
                  </li>
                );
              })}
            </ul>
            <button onClick={closeModal} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
