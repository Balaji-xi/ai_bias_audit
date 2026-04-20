from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.ml_service import ml_service

router = APIRouter()

class TrainModelReq(BaseModel):
    dataset_id: str
    target_col: str
    model_type: str = 'rf'

class DetectBiasReq(BaseModel):
    dataset_id: str
    target_col: str
    sensitive_cols: List[str]

class MitigateBiasReq(BaseModel):
    dataset_id: str
    target_col: str
    sensitive_col: str
    model_type: str = 'rf'

@router.post("/api/upload-data")
async def upload_data(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    content = await file.read()
    try:
        result = ml_service.save_dataset(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.post("/api/train-model")
async def train_model(req: TrainModelReq):
    try:
        result = ml_service.train_model(req.dataset_id, req.target_col, req.model_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/detect-bias")
async def detect_bias(req: DetectBiasReq):
    try:
        result = ml_service.detect_bias(req.dataset_id, req.target_col, req.sensitive_cols)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/mitigate-bias")
async def mitigate_bias(req: MitigateBiasReq):
    try:
        result = ml_service.mitigate_bias(req.dataset_id, req.target_col, req.sensitive_col, req.model_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
