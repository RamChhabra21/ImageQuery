# app/utils.py
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import InceptionV3
from tensorflow.keras.applications.inception_v3 import preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from numpy.linalg import norm
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import faiss

# Load the CLIP model and processor
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


def extract_features(image_source):
    """
    Extract image features using CLIP.
    Accepts file paths or in-memory file-like objects.
    """
    image = Image.open(image_source).convert("RGB")
    inputs = processor(images=image, return_tensors="pt", padding=True)
    with torch.no_grad():
        features = model.get_image_features(**inputs)
    # Normalize the embedding
    features = features / features.norm(dim=-1, keepdim=True)
    return features.squeeze().numpy()

def cosine_similarity(vector1, vector2):
    """Compute cosine similarity between two vectors."""
    return np.dot(vector1, vector2) / (norm(vector1) * norm(vector2))

dimension = 512  # CLIP embedding size
index = faiss.IndexFlatL2(dimension)
def find_top_k(test_embedding, dataset_embeddings, k=5):
    """Find the top k similar images using FAISS."""
    # Ensure the dataset embeddings are added to the FAISS index
    if index.ntotal == 0:
        index.add(np.array(dataset_embeddings))
    distances, indices = index.search(np.array([test_embedding]), k)
    return list(zip(indices[0], distances[0]))