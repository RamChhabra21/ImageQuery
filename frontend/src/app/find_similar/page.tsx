"use client";

import { useState } from "react";

const FindSimilarPage = () => {
  const [file, setFile] = useState<File | null>(null); // For selected image
  const [k, setK] = useState(5); // Default value for `k`
  const [results, setResults] = useState<any[]>([]); // To store similar images
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // Add uploaded image
    formData.append("k", k.toString()); // Add `k` value
    
    try {
      const response = await fetch("/api/find_similar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResults(data.similar_images || []); // Update results
        setMessage("");
      } else {
        setMessage(data.error || "Failed to fetch similar images.");
      }
    } catch (error) {
      setMessage("An error occurred while finding similar images.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Find Similar Images</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-medium">Number of Similar Images (k)</label>
          <input
            type="number"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Find Similar Images
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
      <div className="mt-6">
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Similar Images</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {results.slice(0,k).map((result, index) => (
                <div key={index} className="border p-4 rounded">
                  <iframe
                    src={`https://drive.google.com/file/d/${result}/preview`} 
                    
                    className="w-full h-auto"
                  />
                  <p className="mt-2 text-sm text-gray-600">ID: {`https://drive.google.com/uc?export=view&id=${result}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindSimilarPage;
