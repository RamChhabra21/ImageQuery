"use client";

import { useState } from "react";

const UploadDataset = () => {
  const [links, setLinks] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedLinks = links
      .split("\n")
      .map(link => link.trim())
      .filter(link => link !== "");
  
    try {
      const response = await fetch("/api/upload_dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        body: JSON.stringify({links : formattedLinks}), // Send links as JSON
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Dataset uploaded successfully from Google Drive links!");
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      setMessage("An error occurred while uploading the dataset.");
    } 
  };
  
  

  const handleExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!excelFile) {
      setMessage("Please upload an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);


    try {
      const response = await fetch("/api/upload_excel", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Dataset uploaded successfully from Excel!");
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      setMessage("An error occurred while uploading the Excel file.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Upload Image Dataset</h1>
      <form onSubmit={handleLinksSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Paste Google Drive Links</label>
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="Paste Google Drive links here, each on a new line."
            className="border p-2 rounded w-full"
            rows={5}
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload Dataset (Links)
        </button>
      </form>

      <form onSubmit={handleExcelSubmit} className="space-y-4 mt-6">
        <div>
          <label className="block font-medium">Or Upload Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Upload Dataset (Excel)
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default UploadDataset;
