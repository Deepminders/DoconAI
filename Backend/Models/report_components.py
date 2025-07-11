import os
import tempfile
import shutil
import re
from typing import Optional
from fastapi import UploadFile, HTTPException
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the correct path
current_dir = Path(__file__).parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

groq_api_key = os.getenv("GROQ_API_KEY")

# Fallback to hardcoded key if environment variable is not found
if not groq_api_key:
    print(
        "Warning: GROQ_API_KEY not found in environment variables. Using fallback method."
    )
    # Use your key from .env
    groq_api_key = "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"


class SummaryRequest(BaseModel):
    text: Optional[str] = None
    project_id: Optional[str] = None  # Added project_id to associate with projects


class SummarizerComponents:
    def __init__(self):
        # Initialize with default settings
        self.model_name = "BAAI/bge-small-en"
        self.llm_name = "qwen-qwq-32b"  # Updated model name
        self.chunk_size = 700
        self.chunk_overlap = 50
        self.max_docs = 30

        os.environ["ALLOW_DANGEROUS_DESERIALIZATION"] = "True"

        # Initialize models
        self.hf_embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},  # or "cuda" if you have GPU
            encode_kwargs={"normalize_embeddings": True},
        )

        # Initialize Groq with API key from environment variables
        self.llm = ChatGroq(
            api_key=groq_api_key,
            model_name=self.llm_name,
            temperature=0.7,
            max_tokens=4000,
        )

        self.prompt_template = """
You are an expert project analyst for construction projects.

Given the following context from project documents, generate a concise report with two clearly labeled sections:

1. **What has happened until now?**
   - Summarize all progress, completed milestones, and finished tasks up to the present based on the provided context.
   - Use bullet points or short paragraphs for clarity.

2. **What needs to happen from here on?**
   - List all pending tasks, upcoming milestones, next steps, and recommendations for project completion.
   - Be specific and actionable.

**Context:**
{context}

**Instructions:**
- Do not repeat information between sections.
- Only use information found in the context.
- Be clear, factual, and concise.
- If dates are provided, use them to determine what is completed and what is pending.
- If the current date is not specified, assume the report is being generated at the latest milestone mentioned in the context.

Return only the report with the two sections, properly labeled.
"""

    async def generate_vector_store(
        self, files: list[UploadFile], project_id: str = None
    ):
        """Generate vector store from uploaded files"""
        try:
            # Create project-specific vector store path
            vector_store_path = self._get_vector_store_path(project_id)

            # Save uploaded files temporarily
            temp_dir = tempfile.mkdtemp()
            try:
                for file in files:
                    if not file.filename.lower().endswith(".pdf"):
                        raise HTTPException(
                            status_code=400, detail="Only PDF files are supported"
                        )

                    file_path = os.path.join(temp_dir, file.filename)
                    with open(file_path, "wb") as f:
                        f.write(await file.read())

                # Process documents
                loader = PyPDFDirectoryLoader(temp_dir)
                docs = loader.load()

                if not docs:
                    raise HTTPException(
                        status_code=400, detail="No readable content found in PDFs"
                    )

                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
                )
                final_docs = text_splitter.split_documents(docs[: self.max_docs])

                # Create and save vector store
                vectors = FAISS.from_documents(final_docs, self.hf_embeddings)
                vectors.save_local(vector_store_path)

                return {"message": "Vector store created successfully"}
            finally:
                # Clean up temp files
                shutil.rmtree(temp_dir, ignore_errors=True)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Vector store creation failed: {str(e)}"
            )

    async def generate_summary(self, request: SummaryRequest):
        """Generate summary from vector store"""
        try:
            vector_store_path = self._get_vector_store_path(request.project_id)

            if not os.path.exists(vector_store_path):
                raise HTTPException(
                    status_code=404,
                    detail="Vector store not found. Please upload documents first.",
                )

            # Load vectors
            vectors = FAISS.load_local(
                vector_store_path,
                self.hf_embeddings,
                allow_dangerous_deserialization=True,
            )

            # Create chain
            prompt = ChatPromptTemplate.from_template(self.prompt_template)
            document_chain = create_stuff_documents_chain(self.llm, prompt)

            # Search for relevant docs
            search_query = request.text or "construction summary"
            docs = vectors.similarity_search(search_query, k=5)

            # Generate summary
            raw_summary = document_chain.invoke({"context": docs})

            # Clean the summary before returning
            cleaned_summary = self.clean_summary(raw_summary)

            return {"summary": cleaned_summary}

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Summary generation failed: {str(e)}"
            )

    def clean_summary(self, raw_summary: str) -> str:
        """Clean up the summary text by removing unwanted symbols and formatting."""

        # Remove any leading/trailing whitespace
        cleaned = raw_summary.strip()

        # Remove any <think> blocks that might appear in the output
        cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL)

        # Remove any other HTML-like tags
        cleaned = re.sub(r"<.*?>", "", cleaned)

        # Remove asterisks, which might be used for emphasis in markdown
        cleaned = re.sub(r"\*\*", "", cleaned)

        # Remove hyphens/dashes at the beginning of lines (bullet points)
        cleaned = re.sub(r"(?m)^[\s]*-[\s]+", "", cleaned)

        # Remove hash symbols used for headers
        cleaned = re.sub(r"#{1,6}\s+", "", cleaned)

        # Remove any excessive newlines (more than 2 in a row)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

        # Remove any "Summary:" prefix that might be added
        cleaned = re.sub(r"^Summary:?\s*", "", cleaned)

        return cleaned

    def _get_vector_store_path(self, project_id: str = None):
        """Get project-specific vector store path"""
        base_path = "vector_stores"
        os.makedirs(base_path, exist_ok=True)

        if project_id:
            return os.path.join(base_path, f"project_{project_id}")
        return os.path.join(base_path, "default")


# Create singleton instance
summarizer = SummarizerComponents()


# Helper functions for routes
async def generate_vector_store(files: list[UploadFile], project_id: str = None):
    return await summarizer.generate_vector_store(files, project_id)


async def generate_summary(request: SummaryRequest):
    return await summarizer.generate_summary(request)
