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
  course?: {
    course_id: string;
    section_id: string;
    instructor: {
      name: string;
      email: string;
    };
  };
}

interface Assignment {
  _id: string;
  course: {
    course_id: string;
    section_id: string;
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

  // which row’s “Select Method” was clicked?
  const [methodSelector, setMethodSelector] = useState<Assignment | null>(null);

  // existing manual‐change modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    fetch("/api/assignments")
      .then((res) => res.json())
      .then(setAssignments);

    fetch("/api/candidates")
      .then((res) => res.json())
      .then(setCandidates);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (field: "course" | "instructor") => {
    setSortField(field);
  };

  const filtered = assignments
    .filter((a) =>
      `${a.course.course_id}.${a.course.section_id}`
        .toLowerCase()
        .includes(searchQuery) ||
      a.course.instructor.name.toLowerCase().includes(searchQuery) ||
      a.assignedCandidate.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === "instructor") {
        return a.course.instructor.name.localeCompare(b.course.instructor.name);
      }
      const aCourse = `${a.course.course_id}.${a.course.section_id}`;
      const bCourse = `${b.course.course_id}.${b.course.section_id}`;
      return aCourse.localeCompare(bCourse);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const displayed = showAll ? filtered : paged;

  const handlePageChange = (page: number) => setCurrentPage(page);

  // open the existing manual‐change modal
  const openManual = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
    setMethodSelector(null);
  };

  // placeholder for auto‑assign
  const handleAutoAssign = (assignment: Assignment) => {
    setMethodSelector(null);
    alert(
      `Auto‑assign placeholder for ${assignment.course.course_id}.${assignment.course.section_id}`
    );
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleAssign = async (candidate: Candidate) => {
    if (!selectedAssignment) return;
    await fetch("/api/assignments/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateID: candidate.netid,
        courseNumber: selectedAssignment.course.course_id,
        sectionID: selectedAssignment.course.section_id
      })
    });
    closeModal();
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Assignment View</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <button
                onClick={() => handleSort("instructor")}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Sort by Professor
              </button>
              <button
                onClick={() => handleSort("course")}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Sort by Course
              </button>
            </div>
          </div>

          {/* Table */}
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
                {displayed.map(a => (
                  <tr key={a._id} className="border-t">
                    <td className="p-4">{`${a.course.course_id}.${a.course.section_id}`}</td>
                    <td className="p-4">{a.course.num_required_graders}</td>
                    <td className="p-4">{a.course.instructor.name}</td>
                    <td className="p-4">{a.assignedCandidate.name}</td>
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

          {/* Pagination + Show All Toggle */}
          <div className="flex justify-between items-center mt-4">
            {/* Pagination on left */}
            {!showAll && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            )}
            {/* Show All Toggle on right */}
            <button
              onClick={() => setShowAll(v => !v)}
              className="px-4 py-2 rounded bg-orange-400 text-white hover:bg-orange-500"
            >
              {showAll ? "Show Paginated" : "Show All"}
            </button>
          </div>
        </div>
      </div>

      {/* Method Selector Modal */}
      {methodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative max-w-xs w-full">
        <h2 className="text-lg font-semibold mb-4 text-center">Select Method</h2>
        <div className="flex justify-around space-x-4">
          <button
            onClick={() => openManual(methodSelector)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Manually Change
          </button>
          <button
            onClick={() => handleAutoAssign(methodSelector)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Auto Assign
          </button>
        </div>
        <button
          onClick={() => setMethodSelector(null)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
          </div>
        </div>
      )}

      {/* Manual‐Change Modal */}
      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            {/* …your existing manual-change UI… */}
            <h2 className="text-lg font-semibold mb-4">Assign New Candidate</h2>
            <input
              type="text"
              placeholder="Search candidates"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.toLowerCase())}
              className="border rounded px-4 py-2 w-full mb-4 shadow-sm focus:ring focus:ring-orange-400 outline-none"
            />
            <ul className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {candidates
                .filter(c =>
                  c.name.toLowerCase().includes(searchQuery) ||
                  c.netid.toLowerCase().includes(searchQuery) ||
                  c.major.toLowerCase().includes(searchQuery)
                )
                .map(c => {
                  const isAssigned = !!c.course;
                  return (
                    <li key={c._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.netid}</p>
                        <p className="text-sm text-gray-500">Major: {c.major}</p>
                        <p className="text-sm text-gray-500">GPA: {c.gpa}</p>
                      </div>
                      <button
                        onClick={() => handleAssign(c)}
                        disabled={isAssigned}
                        className={`px-4 py-2 rounded ${
                          isAssigned
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Assign
                      </button>
                    </li>
                  );
                })}
            </ul>
            <button
              onClick={closeModal}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
