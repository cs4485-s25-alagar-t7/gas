import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../context/SemesterContext";

const CreateSemester: React.FC = () => {
  const navigate = useNavigate();
  const { season, year, setSeason, setYear, SEASONS, addSemester } = useSemester();
  const semesterString = season === "none" ? "" : `${season} ${year}`;
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  const [gradersFile, setGradersFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [importPreviousGraders, setImportPreviousGraders] = useState(false);
  const [resumeUploadStatus, setResumeUploadStatus] = useState<string | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [sectionsUploadStatus, setSectionsUploadStatus] = useState<string | null>(null);
  const [sectionsUploadError, setSectionsUploadError] = useState<string | null>(null);
  const [gradersUploadStatus, setGradersUploadStatus] = useState<string | null>(null);
  const [gradersUploadError, setGradersUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Set initial state when component mounts
  useEffect(() => {
    setSeason("none");
    setYear("");
  }, [setSeason, setYear]);

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

  // Upload sections Excel file
  const handleSectionsUpload = async () => {
    if (!sectionsFile) {
      setSectionsUploadError("Please select an Excel file containing sections.");
      return false;
    }
    setSectionsUploadStatus(null);
    setSectionsUploadError(null);
    try {
      const formData = new FormData();
      formData.append("sectionsSheet", sectionsFile);
      formData.append("semester", semesterString);
      const response = await fetch("http://localhost:5002/api/sections/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        setSectionsUploadError(`Failed to upload sections: ${errorText}`);
        return false;
      }
      const result = await response.json();
      if (result.length === 0) {
        setSectionsUploadError("No sections were processed. Please check your Excel file format.");
        return false;
      }
      setSectionsUploadStatus(`Successfully processed ${result.length} sections!`);
      return true;
    } catch (error) {
      setSectionsUploadError(error instanceof Error ? error.message : "Failed to upload sections. Please try again.");
      return false;
    }
  };

  // Upload graders Excel file
  const handleGradersUpload = async () => {
    if (!gradersFile) {
      setGradersUploadError("Please select an Excel file containing graders information.");
      return false;
    }
    setGradersUploadStatus(null);
    setGradersUploadError(null);
    try {
      const formData = new FormData();
      formData.append("candidatesSheet", gradersFile);
      formData.append("semester", semesterString);
      const response = await fetch("http://localhost:5002/api/candidates/upload/excel", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        setGradersUploadError(`Failed to upload graders: ${errorText}`);
        return false;
      }
      const result = await response.json();
      if (result.length === 0) {
        setGradersUploadError("No graders were processed. Please check your Excel file format.");
        return false;
      }
      setGradersUploadStatus(`Successfully processed ${result.length} graders!`);
      return true;
    } catch (error) {
      setGradersUploadError(error instanceof Error ? error.message : "Failed to upload graders. Please try again.");
      return false;
    }
  };

  const handleContinue = async () => {
    if (!resumeFile || !sectionsFile || !gradersFile) {
      alert("Please upload all required files:\n- ZIP file containing resumes\n- Excel sheet of sections\n- Excel sheet of graders");
      return;
    }

    setIsUploading(true);
    
    // Upload resume ZIP first
    const resumeOk = await handleResumeUpload();
    if (!resumeOk) {
      setIsUploading(false);
      return;
    }
    
    // Upload sections Excel
    const sectionsOk = await handleSectionsUpload();
    if (!sectionsOk) {
      setIsUploading(false);
      return;
    }

    // Upload graders Excel
    const gradersOk = await handleGradersUpload();
    if (!gradersOk) {
      setIsUploading(false);
      return;
    }
    
    // Store the import preference in localStorage
    localStorage.setItem(`importPreviousGraders_${semesterString}`, JSON.stringify(importPreviousGraders));
    
    setIsUploading(false);
    alert("Files uploaded successfully! Please return to the dashboard and click 'Start Assignment' to begin the assignment process.");
    navigate("/");
  };

  const handleBackToDashboard = () => {
    if (resumeFile || sectionsFile || gradersFile) {
      const confirmed = window.confirm("You have uploaded files that haven't been saved. If you return to the dashboard, this data will be lost. Are you sure you want to continue?");
      if (!confirmed) {
        return;
      }
    }
    navigate("/");
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
                onChange={e => {
                  const newSeason = e.target.value;
                  setSeason(newSeason as typeof SEASONS[number]);
                  if (newSeason === "none") {
                    setYear("");
                  }
                }}
                className="border px-4 py-2 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none"
              >
                <option value="none">No Semester Selected</option>
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="Year (e.g. 2025)"
                disabled={season === "none"}
                className={`border px-4 py-2 rounded shadow-sm focus:ring focus:ring-orange-400 outline-none w-32 ${season === "none" ? 'bg-gray-100' : ''}`}
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
                {sectionsUploadStatus && <div className="text-green-700 mt-2">{sectionsUploadStatus}</div>}
                {sectionsUploadError && <div className="text-red-600 mt-2 whitespace-pre-line">{sectionsUploadError}</div>}
              </div>

              {/* Graders */}
              <div>
                <label className="block text-gray-700 mb-1">Upload Excel Sheet of Candidates</label>
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
                {gradersUploadStatus && <div className="text-green-700 mt-2">{gradersUploadStatus}</div>}
                {gradersUploadError && <div className="text-red-600 mt-2 whitespace-pre-line">{gradersUploadError}</div>}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToDashboard}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded flex-1 mr-2"
              >
                Back to Dashboard
              </button>

              <button
                onClick={handleContinue}
                disabled={isUploading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded flex-1 ml-2"
              >
                {isUploading ? "Uploading..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSemester;
