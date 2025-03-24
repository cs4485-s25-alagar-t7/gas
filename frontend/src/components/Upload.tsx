import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Upload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [netId, setNetId] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Handle the file upload logic here
      console.log("Uploading file:", selectedFile.name);
      // You can use FormData to send the file to the server
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("netId", netId);

      // Example: Send the file to the server using fetch
      fetch("/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("File uploaded successfully:", data);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-8 bg-white rounded-lg shadow-md max-w-lg mx-auto mt-8">
          <h2 className="text-2xl font-semibold font-poppins text-gray-800 mb-4">Upload Candidate Documents</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Files: <span className="text-red-500">*</span></label>
            <div className="border-dashed border-2 border-gray-300 p-4 rounded-lg text-center">
              <p className="mb-2">Drag and Drop here</p>
              <p className="mb-2">or</p>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-[#114634] cursor-pointer"
              >
                Select files
              </label>
              {selectedFile && (
                <div className="mt-4">
                  <p>Selected file: {selectedFile.name}</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleUpload}
            className="text-white px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 transition-all"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;