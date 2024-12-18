import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData(); // Handle multipart/form-data
    const image = formData.get("image") as File;
    const k = formData.get("k") as string;

    // Prepare data for FastAPI
    const backendData = new FormData();
    backendData.append("file", image);
    backendData.append("k", k);

    // Forward to FastAPI backend
    const response = await axios.post("http://127.0.0.1:8000/find-similar", backendData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error finding similar images:", error);
    return NextResponse.json({ error: "Failed to process the request" }, { status: 500 });
  }
}
