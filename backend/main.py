from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, json, tempfile, logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Meeting Notes Generator", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── OpenAI ───────────────────────────────
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
GPT_DEPLOYMENT = os.getenv("OPENAI_MODEL", "gpt-4o")

# ── Azure Blob Storage (optional) ────────────────────
from azure.storage.blob import BlobServiceClient

STORAGE_CONN  = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
CONTAINER     = os.getenv("AZURE_STORAGE_CONTAINER", "meeting-audio")


class TextInput(BaseModel):
    text: str
    meeting_title: str = "Meeting"


@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Meeting Notes Generator", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "openai_model": GPT_DEPLOYMENT}


# ✅ FIXED TRANSCRIBE (Whisper instead of Azure)
@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    allowed = [".wav", ".mp3", ".ogg", ".flac", ".m4a", ".mp4", ".webm"]
    ext = os.path.splitext(file.filename or "file.wav")[1].lower()

    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type '{ext}'")

    try:
        content = await file.read()

        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Optional: upload to blob
        if STORAGE_CONN:
            try:
                blob_svc = BlobServiceClient.from_connection_string(STORAGE_CONN)
                blob_svc.get_container_client(CONTAINER).upload_blob(
                    f"uploads/{file.filename}", content, overwrite=True
                )
            except Exception as e:
                logger.warning(f"Blob upload skipped: {e}")

        # 🔥 Whisper transcription
        with open(tmp_path, "rb") as audio:
            transcript = client.audio.transcriptions.create(
                model="gpt-4o-transcribe",
                file=audio
            )

        os.unlink(tmp_path)

        text = transcript.text.strip()

        if not text:
            raise HTTPException(422, "No speech detected")

        return {
            "transcript": text,
            "word_count": len(text.split())
        }

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(500, f"Transcription failed: {str(e)}")


@app.post("/generate-notes")
async def generate_notes(input: TextInput):
    if not input.text.strip():
        raise HTTPException(400, "Transcript text cannot be empty.")

    prompt = f"""You are an expert meeting notes assistant.

Meeting Title: {input.meeting_title}

Transcript:
{input.text}

Return ONLY valid JSON with:
summary, key_points, action_items, decisions, next_steps, sentiment, duration_estimate
"""

    try:
        response = client.chat.completions.create(
            model=GPT_DEPLOYMENT,
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500,
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        return {"notes": json.loads(raw)}

    except Exception as e:
        logger.error(f"Notes generation error: {e}")
        raise HTTPException(500, f"Notes generation failed: {str(e)}")


@app.post("/process-full")
async def process_full(
    file: UploadFile = File(...),
    meeting_title: str = Form(default="Meeting")
):
    t_result = await transcribe_audio(file)

    n_result = await generate_notes(
        TextInput(text=t_result["transcript"], meeting_title=meeting_title)
    )

    return {
        "transcript": t_result["transcript"],
        "word_count": t_result["word_count"],
        "notes": n_result["notes"]
    }