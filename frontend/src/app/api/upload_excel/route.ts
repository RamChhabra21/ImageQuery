import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: NextRequest) {
  try {
    // Handle form data
    const formData = await req.formData(); // Parse form data from the request
    const file = formData.get("file"); // Get the file from the form data
  
    // Check if a file was uploaded
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    // Send the file to FastAPI
    const response = await axios.post("http://127.0.0.1:8000/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure correct header for file upload
      },
    });
    
    // Return the response from FastAPI to the client
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error during Excel upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
