import React from "react";
import Navbar from "./Navbar";

const Dashboard: React.FC = () => {
  return (
    <div className="p-8">
      <div className="bg-white shadow-md p-6 rounded-lg flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center space-x-4">
            <div className="text-orange-600 font-extrabold text-3xl">
              UT<span className="text-black">DALLAS</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome Back!
            </h1>
          </div>

          <div className="mt-2">
            <span className="text-sm font-medium text-gray-600 mr-2">
              Current Semester:
            </span>
            <span className="bg-orange-300 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Fall 2025
            </span>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/create-semester")}
          className="bg-orange-300 hover:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
        >
          Create New Semester
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
