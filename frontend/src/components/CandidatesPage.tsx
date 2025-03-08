import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const candidates = [
  { name: "Jane Cooper", school: "ECS", phone: "(225) 555-0118", email: "EMAIL@UTDALLAS.EDU", gpa: "4.00" },
  { name: "Floyd Miles", school: "ECS", phone: "(205) 555-0100", email: "EMAIL@UTDALLAS.EDU", gpa: "4.00" },
  { name: "Ronald Richards", school: "ECS", phone: "(302) 555-0107", email: "EMAIL@UTDALLAS.EDU", gpa: "3.92" },
  { name: "Marvin McKinney", school: "ECS", phone: "(252) 555-0126", email: "EMAIL@UTDALLAS.EDU", gpa: "3.92" },
  { name: "Jerome Bell", school: "ECS", phone: "(629) 555-0129", email: "EMAIL@UTDALLAS.EDU", gpa: "3.82" },
  { name: "Kathryn Murphy", school: "ECS", phone: "(400) 555-0120", email: "EMAIL@UTDALLAS.EDU", gpa: "3.82" },
  { name: "Jacob Jones", school: "ECS", phone: "(200) 555-0112", email: "EMAIL@UTDALLAS.EDU", gpa: "3.56" },
  { name: "Kristin Watson", school: "ECS", phone: "(704) 555-0127", email: "EMAIL@UTDALLAS.EDU", gpa: "3.89" },
];

const CandidatePage: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Already Exists) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Navbar (Already Exists) */}
        <Navbar />

        {/* Content Area */}
        <div className="p-8">
          {/* Title and Search */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Recommend Candidates</h1>
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 shadow-sm focus:ring focus:ring-orange-400 outline-none"
            />
          </div>

          {/* Candidate Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">School</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">GPA</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{candidate.name}</td>
                    <td className="p-4">{candidate.school}</td>
                    <td className="p-4">{candidate.phone}</td>
                    <td className="p-4 text-blue-600">{candidate.email}</td>
                    <td className="p-4">{candidate.gpa}</td>
                    <td className="p-4 flex gap-2">
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">More Details</button>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Not Interested</button>
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

export default CandidatePage;
