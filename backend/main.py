from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import uvicorn
import polars as pl
from datetime import datetime, timezone
import duckdb
import uuid
import hashlib
import traceback
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    #Runs once when the app starts
    try:
        con.execute("""
            CREATE TABLE IF NOT EXISTS user_info (
                user_id TEXT,
                email TEXT,
                name TEXT,
                company_name TEXT,
                company_id TEXT,
                created_at TEXT,
                PRIMARY KEY (user_id)
            )
        """)

        con.execute("""
            CREATE TABLE IF NOT EXISTS fleet_info (
                fleet_size TEXT,
                company_name TEXT,
                vehicle_types TEXT[],
                vehicle_models TEXT[],
                preferred_manufacturers TEXT[],
                energy_cost TEXT,
                department TEXT,
                created_at TEXT,
                company_id TEXT PRIMARY KEY
            )
        """)

        con.execute("""
            CREATE TABLE IF NOT EXISTS vehicle_data (
                document_uuid TEXT,
                company_id TEXT,
                vehicle_id TEXT,
                vehicle_name TEXT,
                lat FLOAT,
                lon FLOAT,
                date_time TEXT,
                route_url TEXT,
                vehicle_charging BOOLEAN,
                speed_kmh FLOAT,
                battery_level FLOAT,
                PRIMARY KEY (document_uuid, vehicle_id)
            )
        """)
        print("DuckDB tables initialized.")

        # get fleet table schema
        # fleet_schema = con.execute(f"PRAGMA table_info(fleet_info)").fetchdf()
        # print(f"------ fleet_schema ------")
        # print(fleet_schema)

        # # get user_info table schema
        # user_info_schema = con.execute(f"PRAGMA table_info(user_info)").fetchdf()
        # print(f"------ user_info_schema ------")
        # print(user_info_schema)

        # # get vehicle_data table schema
        # vehicle_data_schema = con.execute(f"PRAGMA table_info(vehicle_data)").fetchdf()
        # print(f"------ vehicle_data_schema ------")
        # print(vehicle_data_schema)
    except Exception as e:
        traceback.print_exc()
        print("Error initializing tables:", e)

    yield  # App is now running

    # Optionally: cleanup logic here when app shuts down

    
app = FastAPI(title="DocParser API", lifespan=lifespan)
con = duckdb.connect("onboardify.duckdb")

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
        # print(payload)
        df = pl.DataFrame(payload.csv_data)
        df = df.rename(payload.mapping)
        
        # Fix column types for vehicle_data
        # Convert speed_kmh to float if it's not already
        if 'speed_kmh' in df.columns:
            df = df.with_columns(pl.col('speed_kmh').cast(pl.Float64))
            
        # Convert battery_level (vehicle_battery_level in original data) to float if it exists
        if 'vehicle_battery_level' in df.columns:
            df = df.with_columns(pl.col('vehicle_battery_level').cast(pl.Float64).alias('battery_level'))
            df = df.drop('vehicle_battery_level')
        elif 'battery_level' in df.columns:
            df = df.with_columns(pl.col('battery_level').cast(pl.Float64))
            
        # Make sure vehicle_charging is boolean
        if 'vehicle_charging' in df.columns:
            df = df.with_columns(pl.col('vehicle_charging').cast(pl.Boolean))
        
        # Convert lat and lon to float
        if 'lat' in df.columns:
            df = df.with_columns(pl.col('lat').cast(pl.Float64))
        if 'lon' in df.columns:
            df = df.with_columns(pl.col('lon').cast(pl.Float64))
            
        fleet_df = pl.DataFrame([payload.onboarding_data])

        user_df = pl.DataFrame(payload.user_info)
        current_time = datetime.now(timezone.utc).isoformat()

        # add company name in the user row
        company_name = payload.onboarding_data["company_name"]
        company_id = hashlib.md5(company_name.encode("utf-8")).hexdigest()

        user_df = user_df.with_columns([
            pl.lit(payload.onboarding_data["company_name"]).alias("company_name"),
            pl.lit(company_id).alias("company_id"),
            pl.lit(current_time).alias("created_at")
        ])

        table_name = "user_info"
        con.execute(f"INSERT OR IGNORE INTO {table_name} SELECT * FROM user_df")

        # add fleet data in fleet table
        fleet_df = fleet_df.with_columns([
            pl.lit(current_time).alias("created_at"),
            pl.lit(company_id).alias("company_id")
        ])
        
        table_name = "fleet_info"
        print(fleet_df)

        # get fleet table schema
        fleet_schema = con.execute(f"PRAGMA table_info({table_name})").fetchdf()
        print(fleet_schema)

        con.execute(f"INSERT OR IGNORE INTO {table_name} SELECT * FROM fleet_df")

        # create document UUID before adding to the table
        df = df.with_columns([
            pl.lit(str(uuid.uuid4())).alias("document_uuid"),
            pl.lit(company_id).alias("company_id")
        ])
        
        # Print dataframe schema before insert to debug
        print("DataFrame schema before insert:")
        print(df.schema)
        
        # Make sure we have all required columns
        required_columns = [
            "document_uuid", "company_id", "vehicle_id", "vehicle_name", 
            "lat", "lon", "date_time", "route_url", "vehicle_charging", 
            "speed_kmh", "battery_level"
        ]
        
        # Check missing columns and add them with default values
        missing_columns = [col for col in required_columns if col not in df.columns]
        for col in missing_columns:
            if col in ["lat", "lon", "speed_kmh", "battery_level"]:
                df = df.with_columns(pl.lit(None).cast(pl.Float64).alias(col))
            elif col == "vehicle_charging":
                df = df.with_columns(pl.lit(False).alias(col))
            else:
                df = df.with_columns(pl.lit(None).cast(pl.Utf8).alias(col))
        
        # Select only the required columns in the correct order
        df = df.select(required_columns)
        
        table_name = "vehicle_data"
        
        # Use a transaction to safely insert the data
        con.execute("BEGIN TRANSACTION")
        try:
            con.execute(f"INSERT INTO {table_name} SELECT * FROM df")
            con.execute("COMMIT")
        except Exception as e:
            con.execute("ROLLBACK")
            raise e
            
        return {"success": True, "message": "Data successfully processed and stored in DuckDB."}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)