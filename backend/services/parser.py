"""
Extract plain text from uploaded resume files (PDF or DOCX).
"""
import io
import fitz          # PyMuPDF
import docx


def extract_text(file_bytes: bytes, filename: str) -> str:
    fname = filename.lower()
    if fname.endswith(".pdf"):
        return _from_pdf(file_bytes)
    if fname.endswith(".docx"):
        return _from_docx(file_bytes)
    if fname.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {filename}")


def _from_pdf(data: bytes) -> str:
    doc = fitz.open(stream=data, filetype="pdf")
    return "\n".join(page.get_text() for page in doc)


def _from_docx(data: bytes) -> str:
    doc = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs)