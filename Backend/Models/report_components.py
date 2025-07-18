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
        self.llm_name = "meta-llama/llama-4-scout-17b-16e-instruct"  # Updated model name
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
            max_tokens=8000,  # Increased from 4000 to 8000
        )

        self.prompt_template = """
You are a senior project management consultant specializing in construction and infrastructure projects. 

Generate a comprehensive PROJECT STATUS REPORT based on the provided context. Structure the report with the following sections:

## 1. EXECUTIVE SUMMARY
- Project name, timeline, and current status
- Key achievements and critical milestones reached
- Overall project health (On Track/At Risk/Delayed)
- Budget status and resource utilization

## 2. COMPLETED MILESTONES & DELIVERABLES
- List all completed tasks with specific dates and outcomes
- Quantify achievements where possible (e.g., "20 garden beds installed")
- Highlight any early completions or efficiency gains
- Include quality metrics and acceptance criteria met

## 3. CURRENT PROJECT STATUS
- Active work streams and ongoing activities
- Resource allocation and team assignments
- Recent progress since last reporting period
- Any immediate concerns or blockers

## 4. UPCOMING ACTIVITIES & CRITICAL PATH
- Detailed breakdown of remaining tasks with target dates
- Dependencies and sequencing requirements
- Resource requirements and assignments
- Risk mitigation strategies for upcoming phases

## 5. FINANCIAL STATUS
- Budget utilization (spent vs. allocated)
- Cost performance index and variance analysis
- Forecast to completion
- Any budget adjustments or contingency usage

## 6. RISKS & ISSUES
- Active risks with probability and impact assessment
- Mitigation strategies and owners
- Escalated issues requiring attention
- Lessons learned and process improvements

## 7. STAKEHOLDER COMMUNICATION
- Key stakeholder updates and feedback
- Upcoming reviews or approvals required
- Communication plan for next phase

## 8. RECOMMENDATIONS & NEXT STEPS
- Specific, actionable recommendations
- Timeline for implementation
- Success criteria and measurement methods
- Resource requirements

**Context:**
{context}

**Formatting Requirements:**
- Use professional business language
- Include specific dates, quantities, and metrics
- Organize information in clear, scannable sections
- Provide actionable insights and recommendations
- Maintain consistency in terminology and formatting
- Use bullet points and numbered lists for clarity

**Report Standards:**
- Focus on facts and data from the provided context
- Avoid speculation or assumptions not supported by evidence
- Use past tense for completed items, present tense for ongoing work
- Include percentage completion where applicable
- Highlight critical success factors and key performance indicators

Generate a report that would be suitable for senior management review and decision-making.
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
        """Generate enhanced professional summary"""
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

            # Search for relevant docs with broader context
            search_query = (
                request.text or "project status milestones budget timeline deliverables"
            )
            docs = vectors.similarity_search(
                search_query, k=8
            )  # Increased for more context

            # Generate summary
            raw_summary = document_chain.invoke({"context": docs})

            # Clean and format the summary
            cleaned_summary = self.clean_summary(raw_summary)

            # Add professional header
            header = self.generate_report_header(request.project_id)
            final_report = header + "\n" + cleaned_summary

            return {"report": final_report}

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Report generation failed: {str(e)}"
            )

    def clean_summary(self, raw_summary: str) -> str:
        """Enhanced cleaning for professional report formatting"""

        # Remove any leading/trailing whitespace
        cleaned = raw_summary.strip()

        # Remove thinking blocks and HTML tags
        cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL)
        cleaned = re.sub(r"<.*?>", "", cleaned)

        # Remove Markdown bold formatting (**text**)
        cleaned = re.sub(r"\*\*([^*]+)\*\*", r"\1", cleaned)

        # Remove Markdown italic formatting (*text*)
        cleaned = re.sub(r"\*([^*]+)\*", r"\1", cleaned)

        # Remove Markdown headers (# ## ###)
        cleaned = re.sub(r"#{1,6}\s+", "", cleaned)

        # Remove Markdown underlines (__text__)
        cleaned = re.sub(r"__([^_]+)__", r"\1", cleaned)

        # Remove Markdown strikethrough (~~text~~)
        cleaned = re.sub(r"~~([^~]+)~~", r"\1", cleaned)

        # Standardize bullet points
        cleaned = re.sub(r"(?m)^[\s]*[-*]\s+", "• ", cleaned)

        # Fix numbering format
        cleaned = re.sub(r"(?m)^(\d+)\.\s+", r"\1. ", cleaned)

        # Remove excessive newlines but preserve section breaks
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

        # Remove any redundant prefixes
        cleaned = re.sub(r"^(Summary|Report):?\s*", "", cleaned)

        # Clean up any remaining asterisks at the beginning of lines
        cleaned = re.sub(r"(?m)^\*+\s*", "", cleaned)

        # Remove standalone asterisks
        cleaned = re.sub(r"\s+\*+\s+", " ", cleaned)

        return cleaned

    def _get_vector_store_path(self, project_id: str = None):
        """Get project-specific vector store path"""
        base_path = "vector_stores"
        os.makedirs(base_path, exist_ok=True)

        if project_id:
            return os.path.join(base_path, f"project_{project_id}")
        return os.path.join(base_path, "default")

    def generate_report_header(self, project_id: str = None):
        """Generate professional report header"""
        from datetime import datetime

        current_date = datetime.now().strftime("%B %d, %Y")

        header = f"""
PROJECT STATUS REPORT
Generated on: {current_date}
Project ID: {project_id or 'N/A'}
Report Type: Comprehensive Status Review
Prepared by: DoconAI Project Management System

{'='*60}
"""
        return header


# Create singleton instance
summarizer = SummarizerComponents()


# Helper functions for routes
async def generate_vector_store(files: list[UploadFile], project_id: str = None):
    return await summarizer.generate_vector_store(files, project_id)


async def generate_summary(request: SummaryRequest):
    return await summarizer.generate_summary(request)
