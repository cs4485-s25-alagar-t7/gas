import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CandidatesTable from "./CandidatesTable";
import '../output.css';

const CandidatesPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8">
          <CandidatesTable />
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
