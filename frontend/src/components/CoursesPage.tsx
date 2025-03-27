import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const courseData = [
  { numOfGraders: "1", name: "Jane Cooper", courseNumber: "CS1337", professorName: "Srimathi Srinavasan", className: "Computer Science I" },
  { numOfGraders: "1", name: "Floyd Miles", courseNumber: "CS2305", professorName: "James Wilson", className: "Discrete Math I" },
  { numOfGraders: "1", name: "Ronald Richards", courseNumber: "CS2337", professorName: "Doug Degroot", className: "Computer Science II" },
  { numOfGraders: "1", name: "Marvin McKinney", courseNumber: "CS2340", professorName: "John Cole", className: "Computer Architecture" },
  { numOfGraders: "1", name: "Jerome Bell", courseNumber: "CS2336", professorName: "Arnold Gordon", className: "Computer Science II" },
  { numOfGraders: "1", name: "Kathryn Murphy", courseNumber: "CS1436", professorName: "Brian Ricks", className: "Programming Fundamentals" },
  { numOfGraders: "1", name: "Jacob Jones", courseNumber: "CS3354", professorName: "Mark Paulk", className: "Software Engineering" },
  { numOfGraders: "1", name: "Kristin Watson", courseNumber: "CS3377", professorName: "Karami Gity", className: "Systems Programming in UNIX" },
];

const CoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"professorName" | "className" | "courseNumber" | "">("");
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);

  const toggleDropdown = (index: number | null) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSort = (field: "professorName" | "className" | "courseNumber") => {
    setSortField(field);
  };

  const filteredCourses = courseData
    .filter((course) =>
      course.courseNumber.toLowerCase().includes(searchQuery) ||
      course.className.toLowerCase().includes(searchQuery) ||
      course.professorName.toLowerCase().includes(searchQuery) ||
      course.name.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      return a[sortField].localeCompare(b[sortField]);
    });

  return (
    <div className="flex h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />

        {/* Content Area */}
        <div className="p-8">
          {/* Title and Search */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Course View</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search Courses"
                value={searchQuery}
                onChange={handleSearch}
                className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
              />
              <div className="relative">
                <button
                  onClick={() => handleSort("professorName")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Professor Name
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSort("className")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Course Name
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSort("courseNumber")}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Sort by Course Number
                </button>
              </div>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                All Filters
              </button>
            </div>
          </div>

          {/* Course Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Course</th>
                  <th className="p-4">Course Name</th>
                  <th className="p-4"># of Graders</th>
                  <th className="p-4">Professor Name</th>
                  <th className="p-4">Assigned Candidate</th>
                  <th className="p-4">Change Assignment</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{course.courseNumber}</td>
                    <td className="p-4">{course.className}</td>
                    <td className="p-4">{course.numOfGraders}</td>
                    <td className="p-4">{course.professorName}</td>
                    <td className="p-4">{course.name}</td>
                                        <td className="p-4">
                      <div className="relative">
                        {dropdownIndex === index ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => console.log("Manually Change clicked")}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                              Manually Change
                            </button>
                            <button
                              onClick={() => console.log("Auto Assign clicked")}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            >
                              Auto Assign
                            </button>
                            <button
                              onClick={() => toggleDropdown(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-between w-full"
                          >
                            Select Method
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-4 space-x-2">
            <button className="px-3 py-1 bg-gray-300 rounded-lg">1</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">2</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">3</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">4</button>
            <button className="px-3 py-1 bg-gray-300 rounded-lg">...</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;