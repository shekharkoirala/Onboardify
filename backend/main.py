from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import uvicorn
from datetime import datetime
import duckdb

app = FastAPI(title="DocParser API")
con = duckdb.connect("vehicle_data.duckdb")


class UploadPayload(BaseModel):
    data: List[dict[str, Any]]
    mapping: dict[str, str]


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

@app.get("/")
async def root():
    return {"message": "Welcome to Onboardify API"}

@app.post("/documents/", response_model=Document)
async def create_document(document: DocumentCreate):
    # TODO: Implement document creation logic
    return {"message": "Document created successfully"}

@app.get("/documents/{document_id}", response_model=Document)
async def get_document(document_id: str):
    # TODO: Implement document retrieval logic
    return {"message": "Document retrieved successfully"}

@app.post("/documents/upload/")
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

@app.post("/upload")
async def upload_data(payload: UploadPayload):
    try:
        df = pl.DataFrame(payload.data)
        df = df.rename(payload.mapping)

        # create document UUID before adding to the table
        df["document_id"] = str(uuid.uuid4())

        table_name = "vehicle_data"
        con.execute(f"CREATE TABLE IF NOT EXISTS {table_name} AS SELECT * FROM df LIMIT 0")
        con.execute(f"INSERT INTO {table_name} SELECT * FROM df")
        return {"success": True, "message": "Data successfully processed and stored in DuckDB."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)