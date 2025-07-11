import os
import tempfile
import shutil
import re
import pickle
import pandas as pd
import json
from typing import Optional, Dict, Any
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
import asyncio

# Load environment variables
current_dir = Path(__file__).parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    groq_api_key = "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"


class BOQComponents:
    def __init__(self):
        self.chunk_size = 700
        self.chunk_overlap = 50

        os.environ["ALLOW_DANGEROUS_DESERIALIZATION"] = "True"

        # Initialize embeddings
        self.hf_embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

        # Initialize Groq LLM
        self.llm = ChatGroq(
            api_key=groq_api_key,
            model_name="qwen-qwq-32b",
            temperature=0.3,
            max_tokens=2000,
        )

        # Load cost model
        self.cost_model = None
        self.label_encoders = {}
        self._load_cost_model()

        # Feature extraction prompt
        self.feature_extraction_prompt = """
        You are an expert construction cost estimator. Extract building features from this BOQ content.

        Extract these exact features from the BOQ:
        1. building_type: "residential", "commercial", or "industrial"
        2. area_sqm: Total building area in square meters (number)
        3. foundation_type: "concrete" or "slabpilw"
        4. has_parking: "yes" if parking/garage mentioned, "no" if not
        5. floors: Number of floors/stories (number)
        6. labor_rate: Labor cost per hour in USD (number, estimate if not clear)
        7. has_basement: "yes" if basement mentioned, "no" if not
        8. roof_type: "flat", "pitched", or "dome"
        9. location: "urban", "suburban", or "rural"

        Analyze the BOQ content carefully and return ONLY a valid JSON object:

        BOQ Content:
        {context}

        JSON Response:
        """

    def _load_cost_model(self):
        """Load the cost prediction model"""
        try:
            # Try different possible paths
            possible_paths = [
                "ml_models/cost-model.pkl",
                "Models/cost-model.pkl",
                "ml_models/cost_model.pkl",
                "Models/cost_model.pkl",
                "D:\\NOTES\\SEMI-4\\software project\\DoconAI\\Backend\\ml_models\\cost-model.pkl"
            ]

            model_loaded = False
            for model_path in possible_paths:
                if os.path.exists(model_path):
                    with open(model_path, "rb") as f:
                        self.cost_model = pickle.load(f)
                    print(f"✅ Cost model loaded from: {model_path}")
                    model_loaded = True
                    break

            if not model_loaded:
                print("⚠️ Cost model not found, using mock prediction")

            # Try to load encoders
            encoder_paths = [
                "ml_models/label_encoders.pkl",
                "Models/label_encoders.pkl",
            ]

            for encoder_path in encoder_paths:
                if os.path.exists(encoder_path):
                    with open(encoder_path, "rb") as f:
                        self.label_encoders = pickle.load(f)
                    print(f"✅ Label encoders loaded from: {encoder_path}")
                    break

        except Exception as e:
            print(f"❌ Model loading error: {str(e)}")
            self.cost_model = None
            self.label_encoders = {}

    async def process_boq_complete(self, files: list[UploadFile]) -> Dict[str, Any]:
        """Complete BOQ workflow with proper error handling (no project_id)"""
        try:
            # Step 1: Create vector database in BOQ_docs
            print(f"🔄 Step 1: Creating vector database in BOQ_docs...")
            vector_store_path = await self._create_vector_database(files)

            # Step 2: Extract features
            print(f"🔄 Step 2: Extracting features from BOQ_docs vector database...")
            features = await self._extract_features_from_vector_db(vector_store_path)

            # Step 3: Predict cost
            print("🔄 Step 3: Predicting cost...")
            prediction = self._predict_cost_with_model(features)
            predicted_cost = prediction.get("prediction", 0.0)

            return {
                "status": "success",
                "message": f"BOQ processed and cost predicted successfully",
                "project_id": "BOQ_docs",
                "vector_store_path": vector_store_path,
                "extracted_features": features,
                "predicted_cost": float(predicted_cost),
                "prediction_status": prediction.get("status", "success"),
            }

        except Exception as e:
            print(f"❌ BOQ processing error: {str(e)}")
            return {
                "status": "error",
                "message": f"BOQ processing failed: {str(e)}",
                "project_id": "BOQ_docs",
                "vector_store_path": None,
                "extracted_features": self._get_default_features(),
                "predicted_cost": 0.0,
                "prediction_status": "error",
            }

    async def _create_vector_database(self, files: list[UploadFile]) -> str:
        """Create vector database from BOQ PDF in BOQ_docs"""
        temp_dir = tempfile.mkdtemp()
        try:
            # Always use BOQ_docs as vector store path
            vector_store_path = self._get_vector_store_path()

            # Remove existing vector store if it exists
            if os.path.exists(vector_store_path):
                print(f"🗑️ Removing existing vector store: {vector_store_path}")
                shutil.rmtree(vector_store_path, ignore_errors=True)
                print(f"✅ Existing vector store removed: {vector_store_path}")

            # Save uploaded files
            pdf_count = 0
            for file in files:
                if not file.filename.lower().endswith(".pdf"):
                    raise ValueError(f"Only PDF files supported. Got: {file.filename}")

                file_path = os.path.join(temp_dir, file.filename)
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                pdf_count += 1

            print(f"📁 Processing {pdf_count} PDF file(s) for project BOQ_docs")

            # Load and process PDFs
            loader = PyPDFDirectoryLoader(temp_dir)
            docs = loader.load()

            if not docs:
                raise ValueError("No readable content found in PDF files")

            print(f"📄 Loaded {len(docs)} document pages from PDFs")

            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
            )
            final_docs = text_splitter.split_documents(docs)

            if not final_docs:
                raise ValueError("No text content could be extracted from PDF files")

            print(f"✂️ Split into {len(final_docs)} text chunks")

            # Create project-specific vector store
            vector_store = FAISS.from_documents(final_docs, self.hf_embeddings)

            # Ensure directory exists
            os.makedirs(os.path.dirname(vector_store_path), exist_ok=True)

            # Save vector store with project-specific name
            vector_store.save_local(vector_store_path)

            print(f"✅ Project-specific vector database created: {vector_store_path}")
            print(f"✅ Project BOQ_docs: Documents processed: {len(final_docs)}")

            return vector_store_path

        finally:
            # Clean up temporary directory
            shutil.rmtree(temp_dir, ignore_errors=True)

    def _get_vector_store_path(self) -> str:
        """Always use BOQ_docs as vector store path"""
        base_path = "vector_stores"
        os.makedirs(base_path, exist_ok=True)
        return os.path.join(base_path, "BOQ_docs")

    async def _extract_features_from_vector_db(
        self, vector_store_path: str
    ) -> Dict[str, Any]:
        """Extract features from project-specific vector database using Groq"""
        try:
            # Validate vector store exists
            if not os.path.exists(vector_store_path):
                raise ValueError(f"Vector store not found at: {vector_store_path}")

            print(f"📖 Loading vector store from: {vector_store_path}")

            # Load project-specific vector store
            vector_store = FAISS.load_local(
                vector_store_path,
                self.hf_embeddings,
                allow_dangerous_deserialization=True,
            )

            # Get ALL documents first to ensure we have content
            all_documents = []
            try:
                # Get total documents count
                total_docs = vector_store.index.ntotal
                print(f"📊 Total documents in project vector store: {total_docs}")

                if total_docs == 0:
                    print("⚠️ No documents found in project vector store")
                    return self._get_default_features()

                # Get a broader search to capture all relevant content
                broad_search_docs = vector_store.similarity_search(
                    "construction building materials cost", k=min(15, total_docs)
                )
                all_documents.extend(broad_search_docs)
                print(f"🔍 Broad search found {len(broad_search_docs)} documents")

            except Exception as e:
                print(f"⚠️ Error getting documents from vector store: {e}")
                return self._get_default_features()

            # Enhanced search queries for better feature extraction
            search_queries = [
                "building type residential commercial industrial house office factory",
                "total area square meters floor space sqm built-up area construction area",
                "foundation concrete slab pile basement structure footing",
                "parking garage vehicle spaces cars parking lot carport",
                "floors stories levels ground floor first floor basement upper floor",
                "labor cost rate hourly wages worker contractor labor charges",
                "roof roofing tile metal concrete flat pitched dome ceiling",
                "location urban suburban rural city town village area",
                "materials concrete steel wood brick cement sand aggregate",
                "construction cost estimate budget total cost project cost",
                "specifications dimensions measurements quantities bill of quantities",
                "structural work civil work electrical plumbing HVAC",
            ]

            # Get relevant documents with comprehensive search
            relevant_docs = []
            for query in search_queries:
                try:
                    docs = vector_store.similarity_search(
                        query, k=8
                    )  # Increased search results
                    relevant_docs.extend(docs)
                    print(f"🔍 Query '{query[:40]}...' found {len(docs)} documents")
                except Exception as e:
                    print(f"⚠️ Search error for query '{query}': {e}")

            # Combine and deduplicate documents
            all_docs = all_documents + relevant_docs
            unique_docs = []
            seen = set()

            for doc in all_docs:
                content = doc.page_content.strip()
                # Only include meaningful content
                if content and content not in seen and len(content) > 30:
                    unique_docs.append(doc)
                    seen.add(content)

            print(
                f"✅ Found {len(unique_docs)} unique documents for feature extraction"
            )

            # Debug: Print document content samples
            print("📄 Sample document content:")
            for i, doc in enumerate(unique_docs[:3]):
                print(f"Document {i+1}: {doc.page_content[:300]}...")
                print("-" * 50)

            # Extract features with Groq using project-specific documents
            if unique_docs:
                print(
                    f"🤖 Sending {len(unique_docs[:20])} documents to Groq for analysis..."
                )
                features = await self._extract_features_with_groq_retry(
                    unique_docs[:20]
                )
            else:
                print(
                    "⚠️ No relevant documents found in project vector store, using defaults"
                )
                features = self._get_default_features()

            return features

        except Exception as e:
            print(f"❌ Project vector DB extraction error: {str(e)}")
            import traceback

            traceback.print_exc()
            return self._get_default_features()

    async def _extract_features_with_groq_retry(
        self, docs: list, max_retries: int = 3
    ) -> Dict[str, Any]:
        """Use Groq to extract features with retry mechanism"""
        for attempt in range(max_retries):
            try:
                print(f"🤖 Groq extraction attempt {attempt + 1}/{max_retries}")

                # Create prompt with more context
                prompt = ChatPromptTemplate.from_template(
                    self.feature_extraction_prompt
                )
                document_chain = create_stuff_documents_chain(self.llm, prompt)

                # Get response from Groq
                raw_response = document_chain.invoke({"context": docs})
                print(f"🤖 Groq raw response (attempt {attempt + 1}): {raw_response}")

                # Parse features
                features = self._parse_and_validate_features(raw_response)

                # Check if we got meaningful extraction (not all defaults)
                default_features = self._get_default_features()
                if self._is_meaningful_extraction(features, default_features):
                    print(
                        f"✅ Meaningful features extracted on attempt {attempt + 1}: {features}"
                    )
                    return features
                else:
                    print(
                        f"⚠️ Got default-like features on attempt {attempt + 1}, retrying..."
                    )
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2)  # Wait before retry

            except Exception as e:
                print(f"❌ Groq extraction error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)  # Wait before retry

        print("⚠️ All Groq attempts failed, using defaults")
        return self._get_default_features()

    def _parse_and_validate_features(self, raw_response: str) -> Dict[str, Any]:
        """Parse and validate features from Groq response"""
        try:
            # Try to extract JSON from response
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                features = json.loads(json_str)
            else:
                # If no JSON found, try to parse the whole response
                features = json.loads(raw_response)

            # Validate and convert features
            validated_features = self._validate_features(features)
            return validated_features

        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing error: {e}")
            print(f"Raw response: {raw_response}")
            return self._get_default_features()
        except Exception as e:
            print(f"⚠️ Feature parsing error: {e}")
            return self._get_default_features()

    def _validate_features(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize extracted features"""
        validated = {}

        # Define expected features with defaults
        expected_features = {
            "building_type": "residential",
            "area_sqm": 150.0,
            "foundation_type": "concrete",
            "has_parking": "no",
            "floors": 2,
            "labor_rate": 25.0,
            "has_basement": "no",
            "roof_type": "flat",
            "location": "urban",
        }

        for key, default_value in expected_features.items():
            if key in features:
                try:
                    # Type conversion based on expected type
                    if isinstance(default_value, float):
                        validated[key] = float(features[key])
                    elif isinstance(default_value, int):
                        validated[key] = int(features[key])
                    elif isinstance(default_value, str):
                        validated[key] = str(features[key]).lower()
                    else:
                        validated[key] = features[key]
                except (ValueError, TypeError):
                    print(f"⚠️ Invalid value for {key}: {features[key]}, using default")
                    validated[key] = default_value
            else:
                validated[key] = default_value

        return validated

    def _get_default_features(self) -> Dict[str, Any]:
        """Get default features for cost prediction"""
        return {
            "building_type": "residential",
            "area_sqm": 150.0,
            "foundation_type": "concrete",
            "has_parking": "no",
            "floors": 2,
            "labor_rate": 25.0,
            "has_basement": "no",
            "roof_type": "flat",
            "location": "urban",
        }

    def _is_meaningful_extraction(
        self, features: Dict[str, Any], defaults: Dict[str, Any]
    ) -> bool:
        """Check if extraction found meaningful data vs defaults"""
        # Count how many features are different from defaults
        different_count = 0
        total_count = len(defaults)

        for key, default_value in defaults.items():
            if key in features and features[key] != default_value:
                different_count += 1

        # If more than 30% of features are different from defaults, consider it meaningful
        meaningful_threshold = 0.3
        is_meaningful = (different_count / total_count) > meaningful_threshold

        print(
            f"📊 Meaningful extraction check: {different_count}/{total_count} features differ from defaults ({different_count/total_count:.1%})"
        )

        return is_meaningful

    def _predict_cost_with_model(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict cost using the loaded model"""
        try:
            if not self.cost_model:
                print("⚠️ No cost model available, using mock prediction")
                # Mock prediction based on area and type
                base_cost = features.get("area_sqm", 150) * 500  # $500 per sqm
                if features.get("building_type") == "commercial":
                    base_cost *= 1.5
                elif features.get("building_type") == "industrial":
                    base_cost *= 1.3

                return {
                    "prediction": base_cost,
                    "status": "mock_prediction",
                    "message": "Used mock prediction algorithm",
                }

            # Prepare features for model
            feature_df = pd.DataFrame([features])

            # Apply label encoders if available
            for column, encoder in self.label_encoders.items():
                if column in feature_df.columns:
                    try:
                        feature_df[column] = encoder.transform(feature_df[column])
                    except Exception as e:
                        print(f"⚠️ Encoding error for {column}: {e}")

            # Make prediction
            prediction = self.cost_model.predict(feature_df)[0]

            return {
                "prediction": float(prediction),
                "status": "model_prediction",
                "message": "Used trained model prediction",
            }

        except Exception as e:
            print(f"❌ Cost prediction error: {str(e)}")
            # Fallback to simple calculation
            base_cost = features.get("area_sqm", 150) * 500
            return {
                "prediction": base_cost,
                "status": "fallback_prediction",
                "message": f"Used fallback prediction due to error: {str(e)}",
            }


# Create a global instance
boq_processor = BOQComponents()


async def process_boq_and_predict_complete(files: list[UploadFile]) -> Dict[str, Any]:
    """
    Global function to process BOQ files and predict cost (no project_id)
    """
    try:
        print(f"🚀 Starting BOQ processing for BOQ_docs")
        if not files:
            raise ValueError("No files provided")
        result = await boq_processor.process_boq_complete(files)
        print(f"✅ BOQ processing completed for BOQ_docs")
        return result
    except Exception as e:
        print(f"❌ Global BOQ processing error: {str(e)}")
        return {
            "status": "error",
            "message": f"BOQ processing failed: {str(e)}",
            "project_id": "BOQ_docs",
            "vector_store_path": None,
            "extracted_features": boq_processor._get_default_features(),
            "predicted_cost": 0.0,
            "prediction_status": "error",
        }


# Optional: Add a debug function
def debug_vector_store_content(vector_store_path: str, project_id: str = None):
    """Debug function to check project-specific vector store content"""
    return boq_processor.debug_vector_store_content(vector_store_path, project_id)
