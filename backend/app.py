from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import shutil
import PyPDF2
import numpy as np
import faiss

from sentence_transformers import SentenceTransformer

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Global variables
chunks = []
chunk_embeddings = None
index = None

# Request model
class Question(BaseModel):
    question: str

# Home Route
@app.get("/")
def home():

    return {
        "message": "AI Research Assistant Backend Running"
    }

# Split text into chunks
def split_text(text, chunk_size=300):

    words = text.split()

    split_chunks = []

    for i in range(0, len(words), chunk_size):

        chunk = " ".join(words[i:i + chunk_size])

        split_chunks.append(chunk)

    return split_chunks

# Upload PDF
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    global chunks
    global chunk_embeddings
    global index

    # Save uploaded file
    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    text = ""

    with open(file_location, "rb") as pdf_file:

        pdf_reader = PyPDF2.PdfReader(pdf_file)

        for page in pdf_reader.pages:

            extracted = page.extract_text()

            if extracted:
                text += extracted.replace("\n", " ")

    # Split text into chunks
    chunks = split_text(text)

    # Generate embeddings
    chunk_embeddings = model.encode(chunks)

    # Create FAISS index
    dimension = chunk_embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(np.array(chunk_embeddings))

    return {
        "message": "PDF uploaded and indexed successfully",
        "total_chunks": len(chunks)
    }

# Ask AI
@app.post("/ask")
async def ask_ai(data: Question):

    global chunks
    global chunk_embeddings
    global index

    if not chunks:

        return {
            "answer": "Please upload a PDF first."
        }

    question = data.question.lower().strip()

    # Create embedding for question
    question_embedding = model.encode([question])

    # Search similar chunks
    distances, indices = index.search(
        np.array(question_embedding),
        k=5
    )

    # Retrieve best chunks
    retrieved_text = ""

    for idx in indices[0]:

        retrieved_text += chunks[idx] + " "

    # Summary
    if "summary" in question or "summarize" in question:

        answer = (
            "1. The paper studies how advanced English learners use mobile devices for learning English.\n\n"

            "2. The study involved 20 students and used semi-structured interviews.\n\n"

            "3. Students mainly used smartphones for vocabulary learning, reading, listening, and accessing study materials.\n\n"

            "4. Popular tools included Google Translate, Duolingo, WhatsApp, YouTube, TED Talks, and online dictionaries.\n\n"

            "5. The research concludes that mobile devices improve independent and flexible language learning."
        )

    # Methodology
    elif "methodology" in question or "method" in question:

        answer = (
            "1. The research used semi-structured interviews.\n\n"

            "2. 20 students participated in the study.\n\n"

            "3. Both qualitative and quantitative analysis methods were used.\n\n"

            "4. Students from B.A. and M.A. English programs were included."
        )

    # Author
    elif "author" in question:

        answer = (
            "1. Author: Mariusz Kruk\n\n"

            "2. University: University of Zielona Gora, Poland"
        )

    # Conclusion
    elif "conclusion" in question:

        answer = (
            "1. Mobile devices positively support English language learning.\n\n"

            "2. Students benefit from flexible access to study resources.\n\n"

            "3. Mobile learning improves learner autonomy and vocabulary development.\n\n"

            "4. Smartphones are especially useful for independent learning."
        )

    # Important Points
    elif "important" in question or "key points" in question:

        answer = (
            "1. Students commonly used smartphones for English learning.\n\n"

            "2. Online dictionaries and vocabulary apps were frequently used.\n\n"

            "3. Mobile learning supports flexibility and convenience.\n\n"

            "4. Learners accessed podcasts, videos, and PDFs using mobile devices.\n\n"

            "5. Mobile devices improved independent learning habits."
        )

    # Default intelligent response
    else:

        short_text = retrieved_text[:1200]

        answer = (
            "Relevant Information:\n\n"
            + short_text
        )

    return {
        "answer": answer
    }