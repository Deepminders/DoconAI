from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from Models.boq_components import process_boq_and_predict_complete

cost_routes = APIRouter(prefix="/api/cost", tags=["Cost Prediction"])


class BOQResponse(BaseModel):
    status: str
    message: str
    project_id: Optional[str] = None
    vector_store_path: Optional[str] = None
    extracted_features: Dict[str, Any]
    predicted_cost: float = 0.0
    prediction_status: str




# ADD THIS NEW ENDPOINT for your frontend
@cost_routes.post("/boq/process")
async def process_boq_endpoint(
    files: List[UploadFile] = File(..., description="BOQ PDF files"),
):
    """
    Process BOQ files and predict construction cost - Always use BOQ_docs as vector store.
    """
    try:
        print("=" * 50)
        print("🔍 BACKEND DEBUG - BOQ Process Endpoint Called")
        print("=" * 50)
        print(f"📁 Number of files: {len(files)}")

        # Log file details
        for i, file in enumerate(files):
            print(
                f"📄 File {i+1}: {file.filename} ({file.size} bytes, {file.content_type})"
            )

        # Validate files
        for file in files:
            if not file.filename.lower().endswith(".pdf"):
                error_msg = (
                    f"Invalid file type: {file.filename}. Only PDF files are allowed."
                )
                print(f"❌ FILE VALIDATION ERROR: {error_msg}")
                raise HTTPException(status_code=400, detail=error_msg)

        # Process BOQ using fixed vector store name
        print(f"🔄 Starting BOQ processing for BOQ_docs")
        result = await process_boq_and_predict_complete(files)
        print(f"✅ BOQ processing completed successfully")
        print(f"📊 Result status: {result.get('status', 'unknown')}")
        print(f"📊 Predicted cost: {result.get('predicted_cost', 'unknown')}")

        if result.get("predicted_cost") is None:
            result["predicted_cost"] = 0.0

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Add a health check endpoint for debugging
@cost_routes.get("/health")
async def cost_health_check():
    return {
        "status": "healthy",
        "service": "Cost Estimation Service",
        "endpoints": [
            "/api/cost/boq/upload-and-predict",
            "/api/cost/boq/process",
            "/api/cost/health",
        ],
    }