import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../context/SemesterContext";

const CreateSemester: React.FC = () => {
  const navigate = useNavigate();
  const { season, year, setSeason, setYear, SEASONS, addSemester } = useSemester();
  const semesterString = `${season} ${year}`;
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  const [gradersFile, setGradersFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [importPreviousGraders, setImportPreviousGraders] = useState(false);
  const [resumeUploadStatus, setResumeUploadStatus] = useState<string | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  // Upload resume ZIP logic (like CandidatesPage)
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setResumeUploadError("Please select a ZIP file containing resumes.");
      return false;
    }
    setResumeUploadStatus(null);
    setResumeUploadError(null);
    try {
      const formData = new FormData();
      formData.append("resumeZip", resumeFile);
      formData.append("semester", semesterString);
      const response = await fetch("http://localhost:5002/api/candidates/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        setResumeUploadError(`Failed to upload resumes: ${errorText}`);
        return false;
      }
      const result = await response.json();
      if (result.processedCount === 0) {
        setResumeUploadError(`No resumes were processed. Please check that your ZIP file contains PDF files.\nFiles found: ${result.filesFound?.join(', ') || 'none'}`);
        return false;
      } else {
        setResumeUploadStatus(`Successfully processed ${result.processedCount} resumes!`);
        addSemester(semesterString);
        return true;
      }
    } catch (error) {
      setResumeUploadError(error instanceof Error ? error.message : "Failed to upload resumes. Please try again.");
      return false;
    }
  };

  const handleContinue = async () => {
    // if (!resumeFile || !sectionsFile || !gradersFile) {
    //   alert("Please upload all three files before continuing.");
    if (!resumeFile) {
      alert("Please upload a ZIP file containing resumes.");
      return;
    }
    // Upload resume ZIP first
    const resumeOk = await handleResumeUpload();
    if (!resumeOk) return;
    setUploadDone(true);
    alert("Files ready! You can now start the assignment.");
  };

  const handleStartAssignment = () => {
    setIsStarting(true);
    if (importPreviousGraders) {
      alert("Importing previous/returning graders into assignment (simulated).");
    }
    setTimeout(() => {
      alert(`Assignment started for ${season} ${year}!`);
      setIsStarting(false);
      navigate("/");
    }, 500);
  };

  const handleResetLastSemester = () => {
    if (window.confirm("Reset the most recent semester's data? This cannot be undone.")) {
      alert("Last semester data has been reset (simulated).");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-center items-center flex-1">
          <div className="p-8 bg-orange-100 rounded-md shadow-md max-w-lg w-full space-y-6">
            <h1 className="text-2xl font-semibold text-center">Create New Semester</h1>

            {/* Import Previous Graders Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="importPrevious"
                checked={importPreviousGraders}
                onChange={(e) => setImportPreviousGraders(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="importPrevious" className="text-gray-700">
                Import previous/returning graders into assignment
              </label>
            </div>

            {/* Season and Year Selectors */}
            <div className="flex space-x-4 justify-between">
              <select
                value={season}
                onChange={e => setSeason(e.target.value as typeof SEASONS[number])}
                className="border px-4 py-2 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none"
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="Year (e.g. 2025)"
                className="border px-4 py-2 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none w-32"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* Resume (ZIP) */}
              <div>
                <label className="block text-gray-700 mb-1">Upload Resumes (ZIP)</label>
                <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    className="hidden"
                    onChange={e => handleFileChange(e, setResumeFile)}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Choose File
                  </label>
                  {resumeFile && <p className="mt-2 text-sm">{resumeFile.name}</p>}
                </div>
                <p className="text-sm text-gray-500">Format accepted: .zip (containing PDFs)</p>
                {resumeUploadStatus && <div className="text-green-700 mt-2">{resumeUploadStatus}</div>}
                {resumeUploadError && <div className="text-red-600 mt-2 whitespace-pre-line">{resumeUploadError}</div>}
              </div>

              {/* Sections */}
              {/*
              <div>
                <label className="block text-gray-700 mb-1">Upload Excel Sheet of Sections</label>
                <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
                  <input
                    id="sections-upload"
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={e => handleFileChange(e, setSectionsFile)}
                  />
                  <label
                    htmlFor="sections-upload"
                    className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Choose File
                  </label>
                  {sectionsFile && <p className="mt-2 text-sm">{sectionsFile.name}</p>}
                </div>
                <p className="text-sm text-gray-500">Format accepted: .xlsx</p>
              </div>
              */}

              {/* Graders */}
              {/*
              <div>
                <label className="block text-gray-700 mb-1">Upload Excel Sheet of Graders</label>
                <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
                  <input
                    id="graders-upload"
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={e => handleFileChange(e, setGradersFile)}
                  />
                  <label
                    htmlFor="graders-upload"
                    className="hover:bg-orange-200 border border-orange-400 text-orange-600 px-4 py-2 rounded font-semibold cursor-pointer"
                  >
                    Choose File
                  </label>
                  {gradersFile && <p className="mt-2 text-sm">{gradersFile.name}</p>}
                </div>
                <p className="text-sm text-gray-500">Format accepted: .xlsx</p>
              </div>
              */}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded flex-1 mr-2"
              >
                Back to Dashboard
              </button>

              {!uploadDone ? (
                <button
                  onClick={handleContinue}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded flex-1 ml-2"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleStartAssignment}
                  disabled={isStarting}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded flex-1 ml-2"
                >
                  {isStarting ? "Starting…" : "Start Assignment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSemester;
