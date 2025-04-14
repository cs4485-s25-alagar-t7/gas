import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const CreateSemester: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
    <div className="flex-1 flex flex-col">
      <Navbar />

      <div className="flex justify-center items-center flex-1">
        <div className="p-8 bg-orange-100 rounded-md shadow-md max-w-lg w-full">
        <h1 className="text-2xl font-semibold mb-6 text-center">Create New Semester</h1>

        <div className="flex justify-between mb-4">
          <button className="bg-white px-6 py-2 rounded shadow hover:bg-orange-200 border border-orange-400 text-orange-600">
            Fall
          </button>
          <button className="bg-white px-6 py-2 rounded shadow hover:bg-orange-200 border border-orange-400 text-orange-600">
            Spring
          </button>
          <button className="bg-white px-6 py-2 rounded shadow hover:bg-orange-200 border border-orange-400 text-orange-600">
            Summer
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Enter Year (20xx):</label>
          <input
            type="text"
            placeholder="2025"
            className="w-full border px-4 py-2 rounded shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Upload Resume PDF</label>
          <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
            <input type="file" accept=".pdf" className="hidden" id="resume-upload" />
            <label
            htmlFor="resume-upload"
            className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
            >
            Choose File
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Format accepted: .pdf</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Upload Excel Sheet of Sections</label>
          <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
            <input type="file" accept=".xlsx" className="hidden" id="sections-upload" />
            <label
            htmlFor="sections-upload"
            className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
            >
            Choose File
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Format accepted: .xlsx</p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Upload Excel Sheet of Graders</label>
          <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
            <input type="file" accept=".xlsx" className="hidden" id="graders-upload" />
            <label
            htmlFor="graders-upload"
            className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
            >
            Choose File
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Format accepted: .xlsx</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded flex-1"
          >
            Back to Dashboard
          </button>
          <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded flex-1">
            Continue
          </button>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateSemester;
