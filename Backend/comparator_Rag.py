import os
import uuid
from google import genai
from dotenv import load_dotenv
import chromadb
import fitz  # PyMuPDF
import re
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import pandas as pd
import pytesseract
from PIL import Image
import pytesseract
import json
import time
from google.genai.errors import ClientError

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# Load environment variables from .env file
load_dotenv()

document_directory = "Uploaded_Documents"

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

llm = genai.Client(api_key=api_key)


def create_vector_store(document_name: str):
    """
    Create a persistent Chroma vector store for a given document.
    - Supports PDF or plain text files in 'documents/'.
    - Uses chunking (size=500, overlap=100).
    - Stores the vector DB in 'vector_store/{document_name}/'.
    """

    print(f"Starting vector store creation for: {document_name}")

    # Paths
    # Always resolve paths relative to this script's directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    doc_path = os.path.join(base_dir, document_directory, document_name)
    vector_store_path = os.path.join(base_dir, "vector_store", document_name)
    print(f"Document path: {doc_path}")
    print(f"Vector store path: {vector_store_path}")

    # Check file exists
    if not os.path.exists(doc_path):
        raise FileNotFoundError(f"Document '{doc_path}' not found!")
    print("Document found.")

    # Load text
    ext = os.path.splitext(document_name)[1].lower()
    if ext == ".pdf":
        print("Loading PDF document...")
        loader = PyPDFLoader(doc_path)
        pages = loader.load()
        text = "\n".join([page.page_content for page in pages])
        print(f"Loaded {len(pages)} pages from PDF.")
    elif ext in [".txt", ".md"]:
        print("Loading plain text document...")
        with open(doc_path, "r", encoding="utf-8") as f:
            text = f.read()
        print("Loaded text document.")
    elif ext in [".xlsx", ".xls"]:
        print("Loading Excel document...")
        df = pd.read_excel(doc_path, sheet_name=None)
        text = ""
        for sheet_name, sheet in df.items():
            text += f"\nSheet: {sheet_name}\n"
            text += sheet.to_string(index=False)
        print(f"Loaded Excel document with {len(df)} sheets.")
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # If no text or less than 100 characters, use scanner like google lens to extract text
    if not text or len(text.strip()) < 100:
        print("Document appears to be scanned or contains very little text. Attempting OCR extraction...")
        try:
            doc = fitz.open(doc_path)
            ocr_text = ""
            for page_num in range(len(doc)):
                pix = doc[page_num].get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_text = pytesseract.image_to_string(img)
                ocr_text += page_text + "\n"
            text = ocr_text
            print("OCR extraction complete.")
        except ImportError:
            raise ImportError("pytesseract and Pillow are required for OCR. Install with 'pip install pytesseract pillow'.")

    # Chunk text
    print("Splitting text into chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    chunks = splitter.split_text(text)
    print(f"Text split into {len(chunks)} chunks.")

    # Load embedding model
    print("Loading embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Embedding model loaded.")

    # Embed in batches
    print("Encoding chunks into embeddings...")
    embeddings = []
    batch_size = 32
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        print(f"Encoding batch {i//batch_size + 1} ({len(batch)} chunks)...")
        batch_embeddings = model.encode(batch)
        embeddings.extend(batch_embeddings)
    print(f"Encoded all chunks into embeddings. Total embeddings: {len(embeddings)}")

    # Create persistent Chroma DB
    print("Creating persistent Chroma vector store...")
    os.makedirs(vector_store_path, exist_ok=True)
    client = chromadb.PersistentClient(path=vector_store_path)
    collection = client.get_or_create_collection(name="embeddings")
    print("Chroma vector store ready. Adding embeddings...")

    # Add embeddings
    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        chunk_id = f"{document_name}_{idx}_{uuid.uuid4()}"
        collection.add(
            ids=[chunk_id],
            documents=[chunk],
            embeddings=[embedding.tolist()],
            metadatas=[{
                "source_document": document_name,
                "chunk_index": idx
            }]
        )
        if (idx + 1) % 10 == 0 or idx == len(chunks) - 1:
            print(f"Added {idx + 1}/{len(chunks)} embeddings.")

    print(f"Vector store created for '{document_name}' with {len(chunks)} chunks at '{vector_store_path}'")


def compare_two_documents(doc1: str, doc2: str, topic: str):
    """
    Compare two documents for the same question using vector search.
    - Loads each document's vector store
    - Queries each with the question
    - Combines the top chunks
    - Sends to LLM for a comparison answer
    """

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model = SentenceTransformer('all-MiniLM-L6-v2')

    def get_context(document_name):
        vector_store_path = os.path.join(base_dir, "vector_store", document_name)

        if not os.path.exists(vector_store_path):
            raise FileNotFoundError(f"Vector store for '{document_name}' not found at '{vector_store_path}'")

        client = chromadb.PersistentClient(path=vector_store_path)
        collection = client.get_collection(name="embeddings")

        question_embedding = model.encode([topic])[0]

        results = collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=7
        )

        if not results or not results.get('documents') or not results['documents'][0]:
            return "No relevant information found."

        context = "\n\n".join([doc for doc in results['documents'][0] if doc])
        return context

    # Get context from both documents
    context1 = get_context(doc1)
    context2 = get_context(doc2)

    # Prepare prompt for your LLM
    prompt = (
        f"You are an expert document analyst.\n\n"
        f"Task:\n"
        f"1. Read and understand the topic: '{topic}'.\n"
        f"2. Extract the key points from each document that relate to this topic.\n"
        f"3. Provide a clear comparison as a list of bullet points.\n\n"
        f"Content:\n"
        f"--- Document 1 ({doc1}) ---\n{context1}\n\n"
        f"--- Document 2 ({doc2}) ---\n{context2}\n\n"
        f"Output:\n"
        f"Respond ONLY in valid JSON format with this structure:\n\n"
        f"{{\n"
        f"  \"topic\": \"{topic}\",\n"
        f"  \"doc1\": [\"Bullet point 1\", \"Bullet point 2\", \"...\"],\n"
        f"  \"doc2\": [\"Bullet point 1\", \"Bullet point 2\", \"...\"],\n"
        f"  \"summary\": [\"Bullet point 1\", \"Bullet point 2\", \"...\"]\n"
        f"}}\n\n"
        f"Summary should contain comparison summary, highlight key differences, similarities, and insights about which is better or how they relate.\n"
        f"Do not add any extra text outside the JSON. Each section must be a list of clear bullet points. Don't add bold words or formatting.\n"
        f"Ensure you extract much details as possible from given contexts.\n"
    )


    # Example Gemini LLM call — replace with your actual LLM code
    response = llm.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # Remove any ```json or ``` from the response if present
    response_text = response.text
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("LLM response is not valid JSON:\n" + response_text)
    return response_json


def extract_numbers_from_text(text):
    """Extract numbers from text using regex."""
    numbers = re.findall(r'\d+\.?\d*', text)
    numbers = [float(n) for n in numbers]
    return numbers


def extract_numbers_from_excel(path):
    """Extract all numeric values from an Excel file using pandas."""
    xl = pd.read_excel(path, sheet_name=None)  # all sheets
    all_numbers = []
    for sheet_name, df in xl.items():
        nums = df.select_dtypes(include='number').values.flatten().tolist()
        all_numbers.extend(nums)
    return all_numbers


def numeric_cost_compare(file1, file2):
    """
    Compare numeric & cost data from two files.
    Supports PDF and Excel (.xlsx).
    """

    base_dir = os.path.dirname(os.path.abspath(__file__))
    path1 = os.path.join(base_dir, document_directory, file1)
    path2 = os.path.join(base_dir, document_directory, file2)

    def extract_numbers(path):
        if path.endswith('.pdf'):
            doc = fitz.open(path)
            text = ""
            for page in doc:
                text += page.get_text()
            return extract_numbers_from_text(text)
        elif path.endswith('.xlsx') or path.endswith('.xls'):
            return extract_numbers_from_excel(path)
        else:
            raise ValueError(f"Unsupported file type for: {path}")

    nums1 = extract_numbers(path1)
    nums2 = extract_numbers(path2)

    prompt = (
    "You are a professional cost analyst.\n\n"
    "Task:\n"
    "1. Carefully analyze the numeric and cost-related details for each document.\n"
    "2. Extract and summarize the key cost figures (totals, budgets, breakdowns).\n"
    "3. Highlight any major differences or similarities.\n"
    "4. Provide a brief conclusion about which document is more cost-effective or has notable cost insights.\n\n"
    f"--- Document 1 ({file1}) Numbers ---\n{nums1}\n\n"
    f"--- Document 2 ({file2}) Numbers ---\n{nums2}\n\n"
    "Output:\n"
    "Respond ONLY in valid JSON with this exact format:\n\n"
    "{\n"
    "  \"doc1\": [\"Key cost point 1\", \"Key cost point 2\", \"...\"],\n"
    "  \"doc2\": [\"Key cost point 1\", \"Key cost point 2\", \"...\"],\n"
    "  \"summary\": [\"Difference point 1\", \"Similarity point 2\", \"Conclusion about which is more cost-effective\"]\n"
    "}\n\n"
    "Rules:\n"
    "- Write each point as a short statement with key figures.\n"
    "- Summary should contain comparison summary, highlight key differences, similarities, and insights about which is better or how they relate.\n"
    "- Do not add any extra text outside the JSON. Each section must be a list of clear bullet points. Don't add bold words or formatting.\n"
    "- Ensure the JSON is valid and parsable."
)



    response = llm.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    # Remove any ```json or ``` from the response if present
    response_text = response.text
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("LLM response is not valid JSON:\n" + response_text)
    return response_json


def extract_metadata(document_name: str):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    doc_path = os.path.join(base_dir, document_directory, document_name)
    doc = fitz.open(doc_path)
    meta = doc.metadata
    return meta

def timestamp_author_compare(doc1, doc2):
    meta1 = extract_metadata(f"{doc1}")
    meta2 = extract_metadata(f"{doc2}")

    prompt = (
    "You are a professional metadata analyst.\n\n"
    "Task:\n"
    "1. Review the timestamp and author metadata for each document.\n"
    "2. Extract key details: creation dates, last modification dates, and author names.\n"
    "3. Highlight any differences or similarities.\n"
    "4. Provide a short conclusion about which document is more recent, who authored them, and any relevant insights.\n\n"
    f"--- Document 1 Metadata ---\n{meta1}\n\n"
    f"--- Document 2 Metadata ---\n{meta2}\n\n"
    "Output:\n"
    "Respond ONLY in valid JSON with this exact format:\n\n"
    "{\n"
    "  \"doc1\": [\"Key point 1\", \"Key point 2\", \"...\"],\n"
    "  \"doc2\": [\"Key point 1\", \"Key point 2\", \"...\"],\n"
    "  \"summary\": [\"Difference point 1\", \"Similarity point 2\", \"Conclusion about which is newer or more reliable\"]\n"
    "}\n\n"
    "Rules:\n"
    "- Include dates and author names clearly.\n"
    "- Summary should contain comparison summary, highlight key differences, similarities, and insights about which is better or how they relate.\n"
    "- Do not add any extra text outside the JSON. Each section must be a list of clear bullet points. Don't add bold words or formatting.\n"
    "- Ensure the JSON is valid and parsable."
)

    response = llm.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    # Remove any ```json or ``` from the response if present
    response_text = response.text
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("LLM response is not valid JSON:\n" + response_text)
    return response_json



def smart_comparison(doc1, doc2):
    # You can reuse previous functions
    context = compare_two_documents(doc1, doc2, "Overall context")
    numeric = numeric_cost_compare(doc1, doc2)
    timestamp = timestamp_author_compare(doc1, doc2)

    final_prompt = (
    "You are a professional AI-powered document comparison analyst.\n\n"
    "Task:\n"
    "1. Carefully review all provided information for both documents.\n"
    "2. Extract and summarize what each document contains, covering the main ideas, costs, dates, and authors, but do NOT mention the aspect names explicitly.\n"
    "3. Highlight key differences, similarities, and strengths in plain language.\n"
    "4. Provide a short conclusion comparing which document is more complete, reliable, or relevant overall.\n\n"
    f"--- Contextual Information ---\n{context}\n\n"
    f"--- Numerical Information ---\n{numeric}\n\n"
    f"--- Timestamps & Author Metadata ---\n{timestamp}\n\n"
    "Output:\n"
    "Respond ONLY in valid JSON with this exact format:\n\n"
    "{\n"
    "  \"doc1\": [\"Key point 1\", \"Key point 2\", \"...\"],\n"
    "  \"doc2\": [\"Key point 1\", \"Key point 2\", \"...\"],\n"
    "  \"summary\": [\"Difference point 1\", \"Similarity point 2\", \"Final conclusion\"]\n"
    "}\n\n"
    "Rules:\n"
    "- Use clear, concise bullet points for each section.\n"
    "- Do NOT mention the words 'context', 'numeric', or 'timestamp' in the bullets.\n"
    "- Summary should contain comparison summary, highlight key differences, similarities, and insights about which is better or how they relate.\n"
    "- Do not add any extra text outside the JSON. Each section must be a list of clear bullet points. Don't add bold words or formatting.\n"
    "- Ensure the JSON is valid and parsable."
)




    response = llm.models.generate_content(
        model="gemini-2.5-flash",
        contents=final_prompt
    )
    
    # Remove any ```json or ``` from the response if present
    response_text = response.text
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    try:
        response_json = json.loads(response_text)
    except json.JSONDecodeError:
        raise ValueError("LLM response is not valid JSON:\n" + response_text)
    return response_json


