import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface ProfessorCourseData {
  professorName: string;
  courseNumber: string;
  section: string;
  assignedCandidate: string;
  recommendedCandidate: string;
  available: boolean;
  reason: string;
}

const ITEMS_PER_PAGE = 5;

const ProfessorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<ProfessorCourseData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProfessorCourseData | "courseSection";
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [currentSemester, setCurrentSemester] = useState("spring 2024");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course-upload modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFile, setCourseFile] = useState<File | null>(null);

  const fetchProfessorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/professors?semester=${currentSemester}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching professor data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessorData();
  }, [currentSemester]);

  const handleSort = (key: keyof ProfessorCourseData | "courseSection") => {
    setSortConfig((prev) =>
      prev && prev.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );
  };

  const sortedCourses = React.useMemo(() => {
    const list = [...courses];
    if (sortConfig) {
      list.sort((a, b) => {
        const aVal =
          sortConfig.key === "courseSection"
            ? `${a.courseNumber} ${a.section}`
            : a[sortConfig.key];
        const bVal =
          sortConfig.key === "courseSection"
            ? `${b.courseNumber} ${b.section}`
            : b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [courses, sortConfig]);

  const filtered = sortedCourses.filter(
    (c) =>
      c.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${c.courseNumber} ${c.section}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      c.assignedCandidate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = showAll
    ? filtered
    : filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCourseFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setCourseFile(e.target.files[0]);
    }
  };

  const handleCourseUploadConfirm = () => {
    setShowCourseModal(false);
    alert(`Course file "${courseFile?.name}" selected.`);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          {/* Header + Controls */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Recommendations View
            </h1>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <button
                onClick={() => handleSort("professorName")}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sort by Professor Name
              </button>
              <button
                onClick={() => handleSort("courseSection")}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sort by Course & Section
              </button>
              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Add Course Sections
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading data...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-600">No course data found</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="p-4">Professor Name</th>
                    <th className="p-4">Course & Section</th>
                    <th className="p-4">Assigned Candidate</th>
                    <th className="p-4">Recommended Candidate</th>
                    <th className="p-4">Reason for mismatch</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((course, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-4">{course.professorName}</td>
                      <td className="p-4">
                        {`${course.courseNumber}.${course.section}`}
                      </td>
                      <td className="p-4">{course.assignedCandidate}</td>
                      <td className="p-4">{course.recommendedCandidate}</td>
                      <td className="p-4 text-red-500 italic">
                        {course.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination + Show All Toggle at Bottom */}
          <div className="flex justify-between items-center mt-6">
            {/* Pagination on Left */}
            {!showAll && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === i + 1
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            )}
            {/* Show All / Paginate Toggle on Right */}
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-4 py-2 rounded-lg bg-orange-400 text-white hover:bg-orange-500"
            >
              {showAll ? "Show Paginated" : "Show All"}
            </button>
          </div>
        </div>
      </div>

      {/* Course Upload Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              Upload Course Sections (.xlsx)
            </h2>
            <input
              id="courses-upload"
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleCourseFileChange}
            />
            <label
              htmlFor="courses-upload"
              className="hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded cursor-pointer block text-center mb-4"
            >
              Choose File
            </label>
            {courseFile && (
              <p className="text-sm text-gray-700 mb-4">{courseFile.name}</p>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCourseModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCourseUploadConfirm}
                disabled={!courseFile}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorsPage;
