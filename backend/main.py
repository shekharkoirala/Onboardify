from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import uvicorn
import polars as pl
from datetime import datetime, timezone
import uuid
import hashlib
import traceback
import boto3
import json
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# AWS Configuration
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Check if we can access the S3 bucket
    try:
        s3_client.head_bucket(Bucket=S3_BUCKET_NAME)
        print(f"Successfully connected to S3 bucket: {S3_BUCKET_NAME}")
    except Exception as e:
        print(f"Error connecting to S3 bucket: {e}")
        raise e

    yield

app = FastAPI(title="DocParser API", lifespan=lifespan)
router = APIRouter(prefix="/api")

class UploadPayload(BaseModel):
    csv_data: List[dict[str, Any]]
    mapping: dict[str, str]
    onboarding_data: dict[str, Any]
    user_info: dict[str, Any]


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DocumentBase(BaseModel):
    title: str
    content: str
    file_type: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: str
    organization_id: str
    user_id: str
    status: str
    parsed_content: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



@router.get("/")
async def root():
    return {"message": "Welcome to Onboardify API"}

@router.post("/documents/", response_model=Document)
async def create_document(document: DocumentCreate):
    # TODO: Implement document creation logic
    return {"message": "Document created successfully"}

@router.get("/documents/{document_id}", response_model=Document)
async def get_document(document_id: str):
    # TODO: Implement document retrieval logic
    return {"message": "Document retrieved successfully"}

@router.post("/documents/upload/")
async def upload_document(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # TODO: Process the uploaded file
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(contents)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload")
async def upload_data(payload: UploadPayload):
    try:
        # Convert CSV data to DataFrame
        df = pl.DataFrame(payload.csv_data)
        df = df.rename(payload.mapping)
        
        # Process the data (type conversions)
        if 'speed_kmh' in df.columns:
            df = df.with_columns(pl.col('speed_kmh').cast(pl.Float64))
            
        if 'vehicle_battery_level' in df.columns:
            df = df.with_columns(pl.col('vehicle_battery_level').cast(pl.Float64).alias('battery_level'))
            df = df.drop('vehicle_battery_level')
        elif 'battery_level' in df.columns:
            df = df.with_columns(pl.col('battery_level').cast(pl.Float64))
            
        if 'vehicle_charging' in df.columns:
            df = df.with_columns(pl.col('vehicle_charging').cast(pl.Boolean))
        
        if 'lat' in df.columns:
            df = df.with_columns(pl.col('lat').cast(pl.Float64))
        if 'lon' in df.columns:
            df = df.with_columns(pl.col('lon').cast(pl.Float64))

        # Generate IDs and timestamps
        current_time = datetime.now(timezone.utc).isoformat()
        company_name = payload.onboarding_data["company_name"]
        company_id = hashlib.md5(company_name.encode("utf-8")).hexdigest()

        # Prepare user data
        user_data = {
            **payload.user_info,
            "company_name": company_name,
            "company_id": company_id,
            "created_at": current_time
        }

        # Prepare fleet data
        fleet_data = {
            **payload.onboarding_data,
            "created_at": current_time,
            "company_id": company_id
        }

        # Add document UUID and company ID to vehicle data
        df = df.with_columns([
            pl.lit(str(uuid.uuid4())).alias("document_uuid"),
            pl.lit(company_id).alias("company_id")
        ])

        # Ensure all required columns exist
        required_columns = [
            "document_uuid", "company_id", "vehicle_id", "vehicle_name", 
            "lat", "lon", "date_time", "route_url", "vehicle_charging", 
            "speed_kmh", "battery_level"
        ]

        # Add missing columns with default values
        missing_columns = [col for col in required_columns if col not in df.columns]
        for col in missing_columns:
            if col in ["lat", "lon", "speed_kmh", "battery_level"]:
                df = df.with_columns(pl.lit(None).cast(pl.Float64).alias(col))
            elif col == "vehicle_charging":
                df = df.with_columns(pl.lit(False).alias(col))
            else:
                df = df.with_columns(pl.lit(None).cast(pl.Utf8).alias(col))

        # Select only required columns
        df = df.select(required_columns)

        # Store data in S3
        try:
            # Store user data
            user_key = f"users/{company_id}/user_info.json"
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=user_key,
                Body=json.dumps(user_data)
            )

            # Store fleet data
            fleet_key = f"fleets/{company_id}/fleet_info.json"
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=fleet_key,
                Body=json.dumps(fleet_data)
            )

            # Store vehicle data
            vehicle_data = df.to_pandas()
            vehicle_key = f"vehicles/{company_id}/{current_time}_vehicle_data.parquet"
            
            # Convert DataFrame to parquet and upload to S3
            parquet_buffer = vehicle_data.to_parquet()
            s3_client.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=vehicle_key,
                Body=parquet_buffer
            )

            return {
                "success": True,
                "message": "Data successfully stored in S3",
                "locations": {
                    "user_data": user_key,
                    "fleet_data": fleet_key,
                    "vehicle_data": vehicle_key
                }
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error storing data in S3: {str(e)}"
            )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing data: {str(e)}"
        )

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)