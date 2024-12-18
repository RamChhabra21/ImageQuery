import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data"; 


export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("Content-Type");
    
    // Handle Google Drive links input (JSON payload)
    if (contentType && contentType.includes("application/json")) {
      const data = await req.json(); // Expecting a JSON payload with the links
      const driveLinks = data.links; // Array of Google Drive links

      // Prepare data for FastAPI to process
      const fastapiData = { links: driveLinks }; 

      // Forward to FastAPI backend
      const response = await axios.post("http://127.0.0.1:8000/upload-dataset", fastapiData, {
        headers: {
          "Content-Type": "application/json", // Send as JSON
        },
      });
      
      return NextResponse.json(response.data);
    }

    // Handle file uploads (previous functionality)
    const formData = await req.formData(); // Handle multipart/form-data
    const files = formData.getAll("files");

    if (files.length > 0) {
      const fastapiData = new FormData();
      files.forEach((file) => {
        fastapiData.append("files", file);
      });

      // Forward to FastAPI backend
      const response = await axios.post("http://127.0.0.1:8000/upload-dataset", fastapiData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return NextResponse.json(response.data);
    }

    return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
  } catch (error) {
    console.error("Error during upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
