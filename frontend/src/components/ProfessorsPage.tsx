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

const ProfessorPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<ProfessorCourseData[]>([]);

  useEffect(() => {
    fetch("/api/professors")
      .then(res => res.json())
      .then(setCourses)
      .catch(console.error);
  }, []);

  const filteredCourses = courses.filter(course =>
    course.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-6">Professor View</h1>
          <input
            type="text"
            placeholder="Search Professor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 mb-4 shadow-sm"
          />

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Course Number</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Assigned Candidate</th>
                  <th className="p-4">Recommended Candidate</th>
                  <th className="p-4">Available Current Semester</th>
                  <th className="p-4">Reason for mismatch</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{course.professorName}</td>
                    <td className="p-4">{course.courseNumber}</td>
                    <td className="p-4">{course.section}</td>
                    <td className="p-4">{course.assignedCandidate}</td>
                    <td className="p-4">{course.recommendedCandidate}</td>
                    <td className="p-4 text-green-600">{course.available ? "True" : "False"}</td>
                    <td className="p-4 text-red-500 italic">{course.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorPage;
