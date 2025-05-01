import React, { useEffect, useState } from "react";
import { useSemester } from "../context/SemesterContext";
import { Button } from "../../@/components/ui/button";
import { Card } from "../../@/components/ui/card";

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

const ITEMS_PER_PAGE = 7;

const SEASONS = ["Spring", "Fall"];
const YEARS = Array.from({ length: 6 }, (_, i) => (2023 + i).toString());

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
  const { season, year } = useSemester();
  const semesterString = `${season} ${year}`;
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [majorFilter, setMajorFilter] = useState<string>("");
  const [seniorityFilter, setSeniorityFilter] = useState<string>("");

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching candidates...");
      const response = await fetch(`http://localhost:5002/api/candidates?semester=${encodeURIComponent(semesterString)}`);
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
  }, [semesterString]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/candidates/${id}`, { 
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
      const file = e.target.files[0];
      console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);
      if (file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
        alert('Please upload a ZIP file containing resumes');
        e.target.value = ''; // Clear the file input
        return;
      }
      setResumeFile(file);
    }
  };

  const handleAddCandidateSubmit = async () => {
    if (!resumeFile) {
      alert("Please upload a ZIP file containing resumes.");
      return;
    }

    try {
      console.log('Preparing to upload file:', resumeFile.name);
      const formData = new FormData();
      formData.append("resumeZip", resumeFile);
      formData.append("semester", semesterString);

      console.log('Sending request with semester:', semesterString);
      const response = await fetch("http://localhost:5002/api/candidates/upload", {
        method: "POST",
        body: formData,
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Failed to upload resumes: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.processedCount === 0) {
        alert(`No resumes were processed. Please check that your ZIP file contains PDF files.\nFiles found: ${result.filesFound?.join(', ') || 'none'}`);
      } else {
        // Fetch only the newly added candidates
        const newCandidatesResponse = await fetch(`http://localhost:5002/api/candidates/recent?semester=${encodeURIComponent(semesterString)}&count=${result.processedCount}`);
        if (!newCandidatesResponse.ok) {
          throw new Error('Failed to fetch newly added candidates');
        }
        const newCandidates = await newCandidatesResponse.json();
        
        // Append new candidates to the existing list
        setCandidates(prevCandidates => [...prevCandidates, ...newCandidates]);
        
        alert(`Successfully processed ${result.processedCount} resumes!`);
        setIsAddCandidateModalOpen(false);
        setResumeFile(null);
        fetchCandidates(); // Refresh the candidates list
      }
    } catch (error) {
      console.error("Error uploading resumes:", error);
      alert(error instanceof Error ? error.message : "Failed to add candidates. Please try again.");
    }
  };

  const getUniqueMajors = () => {
    return Array.from(new Set(candidates.map(c => c.major))).sort();
  };

  const getUniqueSeniority = () => {
    return Array.from(new Set(candidates.map(c => c.seniority))).sort();
  };

  const filteredCandidates = candidates
    .filter(candidate =>
      (candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       candidate.netid.toLowerCase().includes(searchQuery.toLowerCase()) ||
       candidate.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
       candidate.course?.course_name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!majorFilter || candidate.major === majorFilter) &&
      (!seniorityFilter || candidate.seniority === seniorityFilter)
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL candidates for ${season} ${year}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`http://localhost:5002/api/candidates/delete-all?semester=${semesterString}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.message) {
        alert(result.message);
      } else {
        alert(result.message || "Failed to delete all candidates.");
      }
      fetchCandidates();
    } catch (error) {
      alert('Failed to delete all candidates.');
    }
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
                <h1 className="text-2xl font-semibold text-gray-800">Candidate View</h1>
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
                  onClick={() => handleSort("name")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Name
                </Button>
                <Button
                  onClick={() => handleSort("netid")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by NetID
                </Button>
                <Button
                  onClick={() => handleSort("course_id")}
                  variant="outline"
                  className="hover:bg-orange-50"
                >
                  Sort by Course
                </Button>
                <Button
                  onClick={handleAddCandidate}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 shadow-sm"
                >
                  Add Candidate
                </Button>
              </div>
            </div>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading candidates...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : candidates.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No candidates found</p>
            </Card>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Assignment Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Candidate Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Course & Section</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Professor Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedCandidates.map((candidate) => (
                    <tr key={candidate._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          candidate.assignmentStatus
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.assignmentStatus ? "Assigned" : "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="link"
                          className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          {candidate.name}
                        </Button>
                        <div className="text-xs text-gray-500">NetID: {candidate.netid}</div>
                      </td>
                      <td className="px-6 py-4">
                        {candidate.course
                          ? `${candidate.course.course_name || "N/A"}.${candidate.course.section_num || "N/A"}`
                          : "Not Assigned"}
                      </td>
                      <td className="px-6 py-4">{candidate.course?.instructor?.name || "Not Assigned"}</td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to remove this candidate?")) {
                              handleDelete(candidate._id);
                            }
                          }}
                          variant="outline"
                          size="default"
                          className="text-red-600 hover:bg-red-50 font-semibold px-6 py-2 text-base"
                        >
                          Remove Candidate
                        </Button>
                      </td>
                    </tr>
                  ))}
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
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className={currentPage === pageNum ? "bg-orange-500 hover:bg-orange-600" : "hover:bg-orange-50"}
                    >
                      {pageNum}
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
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl rounded-xl">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Student Details</p>
                </div>
                <Button
                  onClick={() => setSelectedCandidate(null)}
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
                {/* Academic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">NetID</p>
                      <p className="font-medium text-gray-900">{selectedCandidate.netid}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Major</p>
                      <p className="font-medium text-gray-900">{selectedCandidate.major}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Seniority</p>
                      <p className="font-medium text-gray-900">{selectedCandidate.seniority}</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assignment Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${selectedCandidate.assignmentStatus ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="font-medium text-gray-900">
                        {selectedCandidate.assignmentStatus ? "Currently Assigned" : "Not Assigned"}
                      </span>
                    </div>
                    {selectedCandidate.course && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Course: {selectedCandidate.course.course_name}</p>
                        <p>Section: {selectedCandidate.course.section_num}</p>
                        <p>Instructor: {selectedCandidate.course.instructor.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Section */}
                {selectedCandidate.resume && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                    <Button
                      variant="outline"
                      className="w-full bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                      onClick={() => window.open(selectedCandidate.resume, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      View Resume
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isAddCandidateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl rounded-xl">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload Candidates</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload a ZIP file containing candidate resumes</p>
                </div>
                <Button
                  onClick={() => {
                    setIsAddCandidateModalOpen(false);
                    setResumeFile(null);
                  }}
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
                  id="resume-upload"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleResumeChange}
                />
                <label
                  htmlFor="resume-upload"
                  className="block w-full p-8 text-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-gray-600 font-medium">Click to upload or drag and drop</div>
                    <div className="text-sm text-gray-500">ZIP files only (.zip)</div>
                    {resumeFile && (
                      <div className="text-sm text-green-600 font-medium mt-2">Selected: {resumeFile.name}</div>
                    )}
                  </div>
                </label>

                {/* Footer */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    onClick={() => {
                      setIsAddCandidateModalOpen(false);
                      setResumeFile(null);
                    }}
                    variant="outline"
                    className="hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddCandidateSubmit}
                    disabled={!resumeFile}
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

export default CandidatesPage;
