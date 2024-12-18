# Image Similarity Search System

This project is a web application that allows users to upload image datasets, including Google Drive links or Excel files containing image links, and perform similarity-based image querying using CLIP (Contrastive Language-Image Pretraining) model. The backend is built using FastAPI, and the frontend is developed with Next.js.

---

## Table of Contents
1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [API Endpoints](#api-endpoints)
4. [Tech Stack](#tech-stack)

---

## Backend Setup

The backend is built using **FastAPI**, and it provides endpoints for uploading image datasets, processing them, and querying similar images.

### Prerequisites

Ensure you have the following installed:

- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:

   git clone "https://github.com/RamChhabra21/ImageQuery.git"
   cd backend
Install the dependencies:


pip install -r requirements.txt
Running the Backend
Navigate to the backend directory and start the FastAPI server with Uvicorn:


uvicorn main:app --reload
The server will be running at http://127.0.0.1:8000. You can access the API documentation at http://127.0.0.1:8000/docs.

Frontend Setup
The frontend is built with Next.js and allows users to upload datasets and test images, view the results, and interact with the backend.

Prerequisites
Ensure you have the following installed:

Node.js (LTS version recommended)
npm (Node package manager)
Installation
git clone "https://github.com/RamChhabra21/ImageQuery.git"
Install the dependencies:

cd frontend
npm install
Running the Frontend
Start the frontend server:


npm run dev
The frontend will be running at http://localhost:3000. You can access the app in your browser.

API Endpoints
The following API endpoints are available for interacting with the backend:

1. Upload Dataset (POST /upload-dataset)
Upload a list of Google Drive image links to build the dataset.

Request Body:
json
{
  "links": ["https://drive.google.com/file/d/xxx/view", "https://drive.google.com/file/d/yyy/view"]
}
Response:
json
{
  "message": "Dataset updated, duplicates skipped.",
  "total_files": 10,
  "skipped_files": []
}
2. Upload Excel File (POST /upload-excel)
Upload an Excel file containing a column GoogleDriveLinks with image links.

Request Body:
File: An Excel file with a GoogleDriveLinks column containing image URLs.
Response:
json
{
  "status": "success",
  "message": "Dataset uploaded successfully."
}
3. Find Similar Images (POST /find-similar)
Upload an image file and retrieve the top k similar images from the dataset.

Request Body:
json
{
  "file": "<image-file>",
  "k": 5
}
Response:
json
{
  "similar_images": ["path_to_image1", "path_to_image2", "path_to_image3"]
}
Tech Stack
Backend:

FastAPI: Web framework for building APIs.
Uvicorn: ASGI server for running FastAPI.
FAISS: Library for efficient similarity search.
CLIP (OpenAI): For extracting image embeddings for similarity comparison.
Pandas: For handling Excel file processing.
gdown: For downloading files from Google Drive.
Frontend:

Next.js: React-based framework for building server-side rendered apps.
Tailwind CSS: Utility-first CSS framework for fast UI development.
Notes
CORS: The backend is set up to allow CORS requests from the frontend running at http://localhost:3000.
Excel File Upload: The uploaded Excel file must contain a column named GoogleDriveLinks, where you list the Google Drive links of the images to be included in the dataset.
Dataset Size: The system is designed to handle large datasets, but performance may vary based on the dataset size and the number of images being processed.
Future Improvements
Implement user authentication to manage different organizations and datasets.
Add additional image processing features (e.g., resizing, format conversion).
Improve performance by optimizing the FAISS indexing process for large-scale datasets.
