import os
import shutil
from uuid import uuid4

from fastapi import UploadFile


DEFAULT_UPLOAD_DIR = "app/storage/uploads"


def save_upload_file(upload_file: UploadFile, upload_dir: str = DEFAULT_UPLOAD_DIR) -> str:
    os.makedirs(upload_dir, exist_ok=True)

    filename = upload_file.filename or "upload.bin"
    ext = filename.split(".")[-1].lower() if "." in filename else "bin"
    unique_name = f"{uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path