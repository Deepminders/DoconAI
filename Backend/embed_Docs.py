import os
import pytesseract
import pandas as pd
from PyPDF2 import PdfReader
from docx import Document
from pdf2image import convert_from_path

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LCDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Configurations
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCUMENT_FOLDER = os.path.join(BASE_DIR, "Uploaded_Documents")
EMBEDDING_FOLDER = os.path.join(BASE_DIR, "embeddings")
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

if not os.listdir(DOCUMENT_FOLDER):
    print("⚠️ No documents found in Uploaded_Documents folder.")
    exit()

# ---------------------- TEXT EXTRACTION HELPERS ----------------------

def extract_text_from_pdf(path):
    text = ""
    try:
        reader = PdfReader(path)
        for page in reader.pages:
            text += page.extract_text() or ""
    except:
        pass

    if text.strip():
        return text

    try:
        images = convert_from_path(path)
        for image in images:
            text += pytesseract.image_to_string(image)
    except Exception as e:
        print(f"OCR failed for {path}: {e}")
    return text

def extract_text_from_docx(path):
    try:
        doc = Document(path)
        return "\n".join([p.text for p in doc.paragraphs])
    except:
        return ""

def extract_text_from_xlsx(path):
    try:
        df = pd.read_excel(path, sheet_name=None)
        all_text = ""
        for sheet in df.values():
            all_text += sheet.astype(str).apply(lambda x: ' '.join(x), axis=1).str.cat(sep='\n')
        return all_text
    except:
        return ""

# ---------------------- EMBEDDING PIPELINE ----------------------

splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

all_docs = []

print(f"📂 Scanning files in `{DOCUMENT_FOLDER}`...")
for filename in os.listdir(DOCUMENT_FOLDER):
    path = os.path.join(DOCUMENT_FOLDER, filename)
    
    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(path)
    elif filename.endswith(".docx"):
        raw_text = extract_text_from_docx(path)
    elif filename.endswith(".xlsx"):
        raw_text = extract_text_from_xlsx(path)
    else:
        print(f"⛔ Skipping unsupported file type: {filename}")
        continue

    if not raw_text.strip():
        print(f"⚠️ Skipping empty/unreadable file: {filename}")
        continue

    chunks = splitter.split_text(raw_text)
    for chunk in chunks:
        all_docs.append(LCDocument(page_content=chunk, metadata={"source": filename}))

print(f"✅ Total chunks prepared: {len(all_docs)}")

# ---------------------- BUILD & SAVE VECTORSTORE ----------------------

os.makedirs(EMBEDDING_FOLDER, exist_ok=True)
vectorstore = FAISS.from_documents(all_docs, embedding_model)
vectorstore.save_local(EMBEDDING_FOLDER)

print("✅ FAISS vectorstore saved using LangChain!")
