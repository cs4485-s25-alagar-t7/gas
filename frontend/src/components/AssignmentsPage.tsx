import React, { useEffect, useState } from "react";
import { useSemester } from "../context/SemesterContext";
import { Button } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";
import { exportToExcel } from "../lib/utils";

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

const ITEMS_PER_PAGE = 7;

const SEASONS = ["Spring", "Fall"];
const YEARS = Array.from({ length: 6 }, (_, i) => (2023 + i).toString());

const AssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"course" | "instructor" | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const { season, year } = useSemester();
  const semesterString = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;

  const [methodSelector, setMethodSelector] = useState<Assignment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchCandidates();
  }, [semesterString]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`http://localhost:5002/api/assignments?semester=${semesterString}`, {
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
      const response = await fetch("http://localhost:5002/api/candidates");
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
        body: JSON.stringify({ semester: semesterString })
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
      const res = await fetch("http://localhost:5002/api/assignments/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment._id })
      });
      if (!res.ok) throw new Error("Failed to auto-assign candidate");
      const data = await res.json();
      console.log("Auto-assign response:", data);
      fetchAssignments();
    } catch (error) {
      console.error("Error auto-assigning candidate:", error);
      setError("Failed to auto-assign candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssignAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5002/api/assignments/generate-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester: semesterString
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
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/assignments/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          candidateId: candidate._id
        })
      });
      if (!res.ok) throw new Error("Failed to assign candidate");
      alert("Candidate assigned successfully");
      closeModal();
      fetchAssignments();
    } catch (error) {
      console.error("Error assigning candidate:", error);
      alert("Failed to assign candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (assignment: Assignment) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/assignments/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment._id })
      });
      if (!res.ok) throw new Error("Failed to unassign candidate");
      alert("Candidate unassigned successfully");
      setMethodSelector(null);
      fetchAssignments();
    } catch (error) {
      console.error("Error unassigning candidate:", error);
      alert("Failed to unassign candidate");
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments
    .filter(a => {
      const matchesSearch = 
        `${a.section.course_name}.${a.section.section_num}`.toLowerCase().includes(searchQuery) ||
        a.section.instructor.name.toLowerCase().includes(searchQuery) ||
        (a.assignedCandidate?.name || '').toLowerCase().includes(searchQuery);
      
      if (showUnassignedOnly) {
        return matchesSearch && !a.assignedCandidate?.name;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (!sortField) {
        // Sort unassigned sections first
        if (!a.assignedCandidate?.name && b.assignedCandidate?.name) return -1;
        if (a.assignedCandidate?.name && !b.assignedCandidate?.name) return 1;
        return 0;
      }
      if (sortField === "instructor") {
        return a.section.instructor.name.localeCompare(b.section.instructor.name);
      }
      return `${a.section.course_name}.${a.section.section_num}`.localeCompare(`${b.section.course_name}.${b.section.section_num}`);
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const displayed = showAll ? filtered : paged;

  const handlePageChange = (page: number) => setCurrentPage(page);

  const openManual = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalOpen(true);
    setMethodSelector(null);
    // Fetch only unassigned candidates for the current semester
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5002/api/candidates?semester=${semesterString}&unassigned=true`);
      if (!response.ok) throw new Error('Failed to fetch unassigned candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching unassigned candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAssignment(null);
  };

  const getSemesterDisplay = () => {
    if (!season || !year || season.trim() === '' || year.trim() === '') return 'No semester selected';
    return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="p-8">
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Assignment View</h1>
                <div className="text-sm text-gray-500 mt-1">Viewing: {getSemesterDisplay()}</div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                />
                <Button
                  onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
                  variant={showUnassignedOnly ? "default" : "outline"}
                  className={showUnassignedOnly ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-orange-50"}
                >
                  {showUnassignedOnly ? "Show All" : "Show Unassigned Only"}
                </Button>
                <Button
                  onClick={() => handleSort("instructor")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Professor
                </Button>
                <Button
                  onClick={() => handleSort("course")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Course
                </Button>
                <Button
                  onClick={handleAutoAssignAll}
                  className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                >
                  Auto Assign All
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Course & Section</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900"># of Graders</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Professor Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Assigned Candidate</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Change Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                ) : (
                  displayed.map((a, idx) => (
                    <tr
                      key={a._id}
                      className={`hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">{a.section ? `${a.section.course_name}.${a.section.section_num}` : 'N/A'}</td>
                      <td className="px-6 py-4">{a.section?.num_required_graders || 'N/A'}</td>
                      <td className="px-6 py-4">{a.section?.instructor?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          a.assignedCandidate?.name ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.assignedCandidate?.name || 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => setMethodSelector(a)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-orange-50"
                        >
                          Select Method
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>

          {/* Pagination Controls + Show All Toggle */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              {!showAll && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50"
                  >
                    First
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={currentPage === i + 1 ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-orange-50"}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50"
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50"
                  >
                    Last
                  </Button>
                </div>
              )}
              <Button
                onClick={() => setShowAll(v => !v)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {showAll ? "Show Paginated" : "Show All"}
              </Button>
            </div>
            <div className="flex justify-end w-full mt-4">
              <Button
                onClick={() => exportToExcel({
                  data: filtered.map(a => ({
                    courseSection: `${a.section.course_name}.${a.section.section_num}`,
                    numGraders: a.section.num_required_graders,
                    professorName: a.section.instructor.name,
                    assignedCandidate: a.assignedCandidate?.name || 'Not Assigned',
                  })),
                  fileName: `assignments_${semesterString.replace(/\s+/g, '_').toLowerCase()}`,
                  sheetName: 'Assignments'
                })}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 shadow-sm"
              >
                Export to Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Method Selector Modal */}
      {methodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Select Assignment Method</h2>
            <div className="space-y-4">
              <Button
                onClick={() => handleAutoAssign(methodSelector)}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Auto Assign
              </Button>
              <Button
                onClick={() => openManual(methodSelector)}
                variant="outline"
                className="w-full hover:bg-orange-50"
              >
                Manual Assign
              </Button>
              {methodSelector.assignedCandidate && (
                <Button
                  onClick={() => handleUnassign(methodSelector)}
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50"
                >
                  Unassign Current Candidate
                </Button>
              )}
              <Button
                onClick={() => setMethodSelector(null)}
                variant="outline"
                className="w-full text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Assignment Modal */}
      {modalOpen && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Assign New Candidate</h2>
            <input
              type="text"
              placeholder="Search candidates"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.toLowerCase())}
              className="border rounded-lg px-4 py-2 w-full mb-4 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
            <div className="max-h-64 overflow-y-auto space-y-4 mb-4">
              {candidates
                .filter(c =>
                  (c.name.toLowerCase().includes(searchQuery) ||
                  c.netid.toLowerCase().includes(searchQuery) ||
                  c.major.toLowerCase().includes(searchQuery)) &&
                  // Only show unassigned candidates
                  !assignments.some(a => a.assignedCandidate && a.assignedCandidate?.netid === c.netid)
                )
                .map(c => (
                  <div key={c._id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.netid}</p>
                        <p className="text-sm text-gray-500">Major: {c.major}</p>
                        <p className="text-sm text-gray-500">GPA: {c.gpa}</p>
                      </div>
                      <Button
                        onClick={() => handleAssign(c)}
                        variant="default"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Assign
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={closeModal}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
