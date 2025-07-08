from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List
from Models.boq_components import BOQRequest, extract_boq_features, generate_boq_vector_store
from pydantic import BaseModel

boq_routes = APIRouter(prefix="/api/boq", tags=["BOQ Processing"])


class BOQUploadResponse(BaseModel):
    message: str
    vector_store_path: str
    documents_processed: int
    status: str


class BOQFeatureResponse(BaseModel):
    features: dict
    status: str
    message: str


@boq_routes.post("/upload-and-process", response_model=BOQUploadResponse)
async def upload_and_process_boq(
    files: List[UploadFile] = File(...),
    project_id: str = None
):
    """Upload BOQ documents and create vector store"""
    try:
        if not files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files provided"
            )
        
        # Validate file types
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {file.filename} is not a PDF. Only PDF files are supported."
                )
        
        # Generate BOQ vector store
        result = await generate_boq_vector_store(files, project_id)
        
        return BOQUploadResponse(
            message=result["message"],
            vector_store_path=result["vector_store_path"],
            documents_processed=result["documents_processed"],
            status="success"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"BOQ processing failed: {str(e)}"
        )


@boq_routes.post("/extract-features", response_model=BOQFeatureResponse)
async def extract_features_from_boq_route(request: BOQRequest):
    """Extract building features from processed BOQ documents"""
    try:
        if not request.project_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project ID is required for feature extraction"
            )
        
        result = await extract_boq_features(request)
        
        return BOQFeatureResponse(
            features=result["features"],
            status=result["status"],
            message=result["message"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Feature extraction failed: {str(e)}"
        )


@boq_routes.post("/upload-and-extract")
async def upload_and_extract_features(
    files: List[UploadFile] = File(...),
    project_id: str = None
):
    """Combined endpoint: Upload BOQ and immediately extract features"""
    try:
        # Step 1: Upload and process BOQ
        upload_result = await generate_boq_vector_store(files, project_id)
        
        # Step 2: Extract features
        extraction_request = BOQRequest(project_id=project_id)
        extraction_result = await extract_boq_features(extraction_request)
        
        return {
            "upload_result": upload_result,
            "extraction_result": extraction_result,
            "status": "success",
            "message": "BOQ uploaded and features extracted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"BOQ upload and extraction failed: {str(e)}"
        )


@boq_routes.get("/vector-store-status/{project_id}")
async def check_boq_vector_store_status(project_id: str):
    """Check if BOQ vector store exists for a project"""
    try:
        import os
        vector_store_path = os.path.join("vector_stores", f"BOQ_{project_id}")
        
        exists = os.path.exists(vector_store_path)
        
        return {
            "project_id": project_id,
            "vector_store_exists": exists,
            "vector_store_path": vector_store_path if exists else None,
            "status": "ready" if exists else "not_found"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Status check failed: {str(e)}"
        )