import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const seasons = ["Fall", "Spring", "Summer"] as const;

const CreateSemester: React.FC = () => {
  const navigate = useNavigate();

  const [season, setSeason] = useState<typeof seasons[number]>("Fall");
  const [year, setYear] = useState<string>("2025");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  const [gradersFile, setGradersFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [importPreviousGraders, setImportPreviousGraders] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    if (!resumeFile || !sectionsFile || !gradersFile) {
      alert("Please upload all three files before continuing.");
      return;
    }
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

            {/* Season Selector */}
            <div className="flex justify-between">
              {seasons.map(s => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-6 py-2 rounded shadow border ${
                    season === s
                      ? "bg-orange-400 text-white border-orange-500"
                      : "bg-white text-orange-600 border-orange-400 hover:bg-orange-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Year Input */}
            <div>
              <label className="block text-gray-700 mb-1">Enter Year (20xx):</label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2025"
                className="w-full border px-4 py-2 rounded shadow-sm"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              {/* Resume */}
              <div>
                <label className="block text-gray-700 mb-1">Upload Resume PDF</label>
                <div className="border-dashed border-2 border-gray-400 p-4 text-center rounded bg-white">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
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
                <p className="text-sm text-gray-500">Format accepted: .pdf</p>
              </div>

              {/* Sections */}
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

              {/* Graders */}
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
