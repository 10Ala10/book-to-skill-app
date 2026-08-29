from pydantic import BaseModel

class JobOut(BaseModel):
    id: str
    filename: str
    pdf_path: str
    skill_name: str | None
    book_type: str
    status: str
    output_dir: str | None
    error: str | None
    created_at: str
    finished_at: str | None
