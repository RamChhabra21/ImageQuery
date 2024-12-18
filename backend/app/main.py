import numpy as np
import hashlib
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.utils import extract_features, find_top_k
from io import BytesIO  # To handle in-memory file objects
import faiss
import gdown
import os
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for specific origins
origins = [
    "http://localhost:3000",
    "http://localhost:3000/api/upload_dataset",# Your frontend running on Next.js
    # Add other origins if needed
]

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows the listed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Variables for dataset and FAISS index
dataset_embeddings = []
image_paths = []  # Store cloud paths here
uploaded_hashes = set()
dimension = 512  # CLIP embedding size
index = faiss.IndexFlatL2(dimension)

class DatasetRequest(BaseModel):
    links: List[str]

@app.post("/upload-dataset")
async def upload_dataset(request: DatasetRequest):
    links=request.links
    """Accept and process reference images, avoiding duplicates by hash."""
    global dataset_embeddings, image_paths, uploaded_hashes, index
    skipped_files = []

    for link in links:
        # Extract file ID from the Google Drive link (both formats are supported)
        file_id = link.split("/d/")[1].split("/")[0]
        download_url = f"https://drive.google.com/uc?id={file_id}"

        # Download the file using gdown
        output_path = f"{file_id}"
        gdown.download(download_url, output_path, quiet=False)

        # Read file content and compute its hash to check for duplicates
        with open(output_path, "rb") as f:
            file_content = f.read()
        file_hash = hashlib.md5(file_content).hexdigest()

        if file_hash in uploaded_hashes:
            skipped_files.append(output_path)
            os.remove(output_path)  # Remove the file if it's skipped
            continue

        # Save file and update dataset and hash set
        image_paths.append(output_path)
        embedding = extract_features(output_path)

        # Ensure embedding is a 1D numpy array (flatten it if it's not)
        embedding = np.array(embedding).flatten()
        dataset_embeddings.append(embedding)
        uploaded_hashes.add(file_hash)

        # Delete the file after processing it
        os.remove(output_path)

    # Convert dataset_embeddings to a 2D numpy array of shape (n, 512)
    if len(dataset_embeddings) > 0:
        dataset_embeddings_np = np.array(dataset_embeddings).astype('float32')
        index.reset()  # Reset the index before adding new embeddings
        index.add(dataset_embeddings_np)  # Add the embeddings to FAISS

    return {
        "message": "Dataset updated, duplicates skipped.",
        "total_files": len(image_paths),
        "skipped_files": skipped_files
    }
    
@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    try:
        # Read the uploaded Excel file content into a pandas DataFrame
        file_content = await file.read()
        df = pd.read_excel(BytesIO(file_content), engine='openpyxl')

        # Assuming the Excel file contains a column 'GoogleDriveLinks' with the links
        if 'GoogleDriveLinks' not in df.columns:
            return {"status": "error", "message": "'GoogleDriveLinks' column not found in the Excel file"}

        # Extract the Google Drive links
        links = df['GoogleDriveLinks'].dropna().tolist()

        # Call the /upload-dataset endpoint with the extracted links
        response = await upload_dataset(DatasetRequest(links=links))

        return response

    except Exception as e:
        return {"status": "error", "message": str(e)}    
    
@app.post("/find-similar")
async def find_similar(file: UploadFile, k: int = 5):
    """
    Find top k similar images to the uploaded test image.
    """
    try:
        # Read the uploaded file in-memory
        file_content = await file.read()
        with BytesIO(file_content) as temp_image:
            # Extract features without saving the file
            test_embedding = extract_features(temp_image)

        # Find top-k similar images
        results = find_top_k(test_embedding, dataset_embeddings, k)
        similar_images = [image_paths[idx] for idx, _ in results]

        return {"similar_images": similar_images}

    except Exception as e:
        return {"error": f"Failed to process file: {str(e)}"}
