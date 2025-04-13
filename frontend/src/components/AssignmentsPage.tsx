import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"course" | "instructor" | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/assignments")
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then(setAssignments)
      .catch((err) => {
        console.error("Error fetching assignments:", err);
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSort = (field: "course" | "instructor") => {
    setSortField(field);
  };

  const filteredAssignments = assignments
    .filter((a) =>
      `${a.course?.course_id || ""}.${a.course?.section_id || ""}`.toLowerCase().includes(searchQuery) ||
      a.course?.instructor?.name.toLowerCase().includes(searchQuery) ||
      a.assignedCandidate?.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === "instructor") {
        return a.course.instructor.name.localeCompare(b.course.instructor.name);
      }

      if (sortField === "course") {
        const aCourse = `${a.course.course_id}.${a.course.section_id}`;
        const bCourse = `${b.course.course_id}.${b.course.section_id}`;
        return aCourse.localeCompare(bCourse);
      }

      return 0;
    });

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const currentAssignments = filteredAssignments.slice(
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
            <h1 className="text-2xl font-semibold text-gray-800">Assignment View</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <button onClick={() => handleSort("instructor")} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Sort by Professor</button>
              <button onClick={() => handleSort("course")} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Sort by Course</button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Course</th>
                  <th className="p-4"># of Graders</th>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Assigned Candidate</th>
                  <th className="p-4">Change Assignment</th>
                </tr>
              </thead>
              <tbody>
                {currentAssignments.map((a, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{`${a.course?.course_id}.${a.course?.section_id}`}</td>
                    <td className="p-4">{a.course?.num_required_graders}</td>
                    <td className="p-4">{a.course?.instructor.name}</td>
                    <td className="p-4">{a.assignedCandidate.name}</td>
                    <td className="p-4">
                      <button className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400">Select Method</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center mt-4 space-x-2">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg ${currentPage === 1 ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}>First</button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded-lg ${currentPage === 1 ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}>Previous</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 rounded-lg ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{index + 1}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}>Next</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded-lg ${currentPage === totalPages ? "bg-gray-300" : "bg-gray-200 hover:bg-gray-300"}`}>Last</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
