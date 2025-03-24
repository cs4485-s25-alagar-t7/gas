import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import PieChartComponent from "./PieChartComponent";


const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-[#514C4C] p-8 rounded-lg shadow-md h-44 flex flex-col justify-center">
                <h3 className="text-white text-lg mb-2">Active Applications</h3>
                <p className="text-4xl text-white font-bold">100</p>
            </div>
            <div className="bg-[#514C4C] p-8 rounded-lg shadow-md h-44 flex flex-col justify-center">
                <h3 className="text-white text-lg mb-2">Total Applications</h3>
                <p className="text-4xl text-white font-bold">500</p>
            </div>
            <div className="bg-[#514C4C] p-8 rounded-lg shadow-md h-44 flex flex-col justify-center">
                <h3 className="text-white text-lg mb-2">Available Positions</h3>
                <p className="text-4xl text-white font-bold">1000</p>
            </div>
           </div>

          {/* Calendar & Applicants Section */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            

            {/* New Applicants */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-700">New Applicants</h3>
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 border rounded-lg mt-2"
              />
              <ul className="mt-4 space-y-3">
                <li className="flex justify-between">
                  <span>Ji Min Yoon</span>
                  <span className="text-sm text-gray-500">email@utdallas.edu</span>
                </li>
                <li className="flex justify-between">
                  <span>Sophie Tran</span>
                  <span className="text-sm text-gray-500">email@utdallas.edu</span>
                </li>
                <li className="flex justify-between">
                  <span>Syed Hussain</span>
                  <span className="text-sm text-gray-500">email@utdallas.edu</span>
                </li>
                <li className="flex justify-between">
                  <span>Solomon Pierce</span>
                  <span className="text-sm text-gray-500">email@utdallas.edu</span>
                </li>
                <li className="flex justify-between">
                  <span>Rayyan Waris</span>
                  <span className="text-sm text-gray-500">email@utdallas.edu</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Applicants by School Chart (Placeholder) */}
          <div className="bg-white p-6 mt-6 rounded-lg shadow-md flex justify-between">
            <h3 className="text-gray-700">Applicants by School</h3>
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white">
              <p className="text-lg">128</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
