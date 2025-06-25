import React, { useEffect, useState } from "react";
import { useSemester } from "../context/SemesterContext";
import { Button } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";
import { exportToExcel } from "../lib/utils";

interface ProfessorCourseData {
  professorName: string;
  courseNumber: string;
  section: string;
  assignedCandidate: string;
  recommendedCandidate: string;
  available: boolean;
  reason: string;
}

const ITEMS_PER_PAGE = 7;

const SEASONS = ["Spring", "Fall"];
const YEARS = Array.from({ length: 6 }, (_, i) => (2023 + i).toString());

const ProfessorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<ProfessorCourseData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProfessorCourseData | "courseSection";
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const { season, year } = useSemester();
  const semesterString = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course-upload modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFile, setCourseFile] = useState<File | null>(null);

  const fetchProfessorData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5002/api/professors?semester=${semesterString}`);
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
    if (season && year && season.trim() !== '' && year.trim() !== '') {
      fetchProfessorData();
    } else {
      setCourses([]);
    }
  }, [season, year, semesterString]);

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
                <h1 className="text-2xl font-semibold text-gray-800">
                  Recommendations View
                </h1>
                <div className="text-sm text-gray-500 mt-1">Viewing: {getSemesterDisplay()}</div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                />
                <Button
                  onClick={() => handleSort("professorName")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Professor Name
                </Button>
                <Button
                  onClick={() => handleSort("courseSection")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Course & Section
                </Button>
                <Button
                  onClick={() => setShowCourseModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 shadow-sm"
                >
                  Add Course Sections
                </Button>
              </div>
            </div>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading data...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Professor Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Course & Section</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Assigned Candidate</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Recommended Candidate</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Reason for mismatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No course data found
                      </td>
                    </tr>
                  ) : (
                    paged.map((course, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{course.professorName}</td>
                        <td className="px-6 py-4">
                          {`${course.courseNumber}.${course.section}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            course.assignedCandidate
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.assignedCandidate || "Not Assigned"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {/* <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            course.recommendedCandidate
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.recommendedCandidate || "None"}
                          </span> */}
                          {Array.isArray(course.recommendedCandidate) && course.recommendedCandidate.length > 0 ? (
                              course.recommendedCandidate.map((name, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-3 py-1 mr-2 mb-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                None
                              </span>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-red-600 italic">
                            {course.reason || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
                onClick={() => setShowAll((prev) => !prev)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {showAll ? "Show Paginated" : "Show All"}
              </Button>
            </div>
            <div className="flex justify-end w-full mt-4">
              <Button
                onClick={() => exportToExcel({
                  data: filtered.map(({ professorName, courseNumber, section, assignedCandidate, recommendedCandidate, reason }) => ({
                    professorName,
                    courseNumber,
                    section,
                    assignedCandidate,
                    recommendedCandidate,
                    reason
                  })),
                  fileName: `professor_recommendations_${semesterString.replace(/\s+/g, '_').toLowerCase()}`,
                  sheetName: 'Recommendations'
                })}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 shadow-sm"
              >
                Export to Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Upload Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl rounded-xl">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Course Sections</h2>
                  <p className="text-sm text-gray-500 mt-1">Select an Excel (.xlsx) file to upload</p>
                </div>
                <Button
                  onClick={() => setShowCourseModal(false)}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 p-2 h-auto rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <input
                  id="courses-upload"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleCourseFileChange}
                />
                <label
                  htmlFor="courses-upload"
                  className="block w-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-gray-600 font-medium">Click to upload or drag and drop</div>
                    <div className="text-sm text-gray-500">Excel files only (.xlsx)</div>
                    {courseFile && (
                      <div className="text-sm text-green-600 font-medium mt-2">Selected: {courseFile.name}</div>
                    )}
                  </div>
                </label>

                {/* Footer */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    onClick={() => setShowCourseModal(false)}
                    variant="outline"
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCourseUploadConfirm}
                    disabled={!courseFile}
                    className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload File
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfessorsPage;
