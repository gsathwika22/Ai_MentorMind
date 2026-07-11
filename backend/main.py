"""
main.py — MentorMind DSA API v4.0 (Real RAG Edition)

Architecture:
  Query → sentence-transformers embed → ChromaDB cosine search
       → top-k chunks injected into system prompt → Groq/Llama generation
"""

from __future__ import annotations

import logging
import os
import random
from contextlib import asynccontextmanager
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

from database import (
    create_tables,
    delete_student_messages,
    get_message_history,
    get_or_create_student,
    get_topic_stats,
    save_message,
    upsert_topic_stat,
    add_points,
    get_leaderboard,
)
from rag_engine import rag_engine

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s │ %(name)s │ %(message)s")
logger = logging.getLogger(__name__)

# ── Lifespan: warm up RAG on startup ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Warming up RAG engine …")
    create_tables()
    count = rag_engine.ingest()
    logger.info("✅ RAG ready — %d chunks in ChromaDB", count)
    yield
    logger.info("🛑 Shutting down MentorMind API")


app = FastAPI(title="MentorMind DSA API", version="4.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Groq client ───────────────────────────────────────────────────────────────

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable not set")

groq_client = Groq(api_key=GROQ_API_KEY)
MODEL = "llama-3.1-8b-instant"

# ── Request / Response models ─────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    student_name: str
    learning_mode: str = "Beginner"
    language: str = "English"
    code_snippet: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    topic: Optional[str]
    retrieved_chunks: List[dict]
    retrieval_scores: List[float]

class QuizResponse(BaseModel):
    topic: str
    difficulty: str
    quiz: str

class ProgressResponse(BaseModel):
    student_name: str
    topic_stats: List[dict]
    message_count: int

# ── System prompt builder ─────────────────────────────────────────────────────

def build_system_prompt(
    student_name: str,
    learning_mode: str,
    rag_context: str,
    conversation_summary: str,
    language: str,
) -> str:
    mode_instructions = {
        "Beginner": (
            "Use simple language, avoid jargon. Explain every concept from first principles. "
            "Give analogies. Break solutions into tiny steps."
        ),
        "Intermediate": (
            "Assume basic CS knowledge. Focus on patterns and trade-offs. "
            "Push the student to reason about time/space complexity."
        ),
        "Advanced": (
            "Treat the student as a peer. Use precise terminology. "
            "Discuss multiple approaches, edge cases, and optimal solutions. "
            "Challenge them with follow-up complexity questions."
        ),
    }

    return f"""You are MentorMind, an expert DSA tutor for LeetCode and competitive programming.

STUDENT: {student_name}
LEVEL:   {learning_mode}

TEACHING STYLE:
{mode_instructions.get(learning_mode, mode_instructions["Beginner"])}

STRICT RULES:
- NEVER give code or pseudocode. Guide with questions and concepts only.
- Always end your response with exactly ONE guiding question to move the student forward.
- Be encouraging but honest — point out misconceptions clearly.
- Keep responses concise (under 200 words).
- You MUST respond in the following language: {language}.
- **CRITICAL**: You MUST ALWAYS append a "📚 References:" section at the very end of your response for the specific DSA concept.
  1. Provide a YouTube tutorial search link format: `[YouTube Tutorial](https://www.youtube.com/results?search_query=topic+name)`
  2. Provide a LeetCode or GeeksForGeeks practice link format: `[Practice Problem](https://leetcode.com/problemset/all/?search=topic+name)`
  Replace "topic+name" with the exact DSA concept being discussed.

{rag_context}

{conversation_summary}

Remember: you are a Socratic tutor. Lead the student to the answer; do not hand it to them.
"""


def summarise_history(history: list[dict]) -> str:
    if not history:
        return ""
    recent = history[-6:]  # last 3 exchanges
    lines = ["RECENT CONVERSATION CONTEXT:"]
    for msg in recent:
        role = "Student" if msg["role"] == "user" else "Mentor"
        lines.append(f"{role}: {msg['content'][:200]}")
    return "\n".join(lines)


# ── Quiz generator ────────────────────────────────────────────────────────────

def generate_quiz(topic: str, difficulty: str) -> str:
    prompt = f"""Generate 3 multiple-choice questions about {topic.replace("_", " ")} in DSA.

Rules:
- Each question has exactly 4 options labelled A, B, C, D
- Exactly one correct answer
- Include a one-sentence explanation for the correct answer
- Difficulty level: {difficulty}

Output valid JSON only — no markdown, no preamble:
[
  {{
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "A",
    "explanation": "..."
  }}
]"""

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=800,
    )
    return response.choices[0].message.content


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "MentorMind DSA API",
        "version": "4.0",
        "rag": "ChromaDB + sentence-transformers (all-MiniLM-L6-v2)",
        "llm": f"Groq / {MODEL}",
        "status": "ready",
    }


@app.post("/ask", response_model=ChatResponse)
def ask_question(chat: ChatRequest):
    # 1. Validate input
    conversation = [
        {"role": m.role, "content": m.content.strip()}
        for m in chat.messages
        if m.content.strip()
    ]
    if not conversation:
        raise HTTPException(status_code=400, detail="No valid messages provided.")

    last_message = conversation[-1]["content"]

    if chat.code_snippet:
        last_message += f"\n\nStudent's Code Submission:\n```\n{chat.code_snippet}\n```\nReview this code pointing out logical errors and ask guiding questions without giving the optimal solution."
        conversation[-1]["content"] = last_message

    # 2. RAG retrieval — semantic search over ChromaDB
    rag_context, retrieved_chunks = rag_engine.build_context(last_message, top_k=4)

    # 3. Persist student + topic stats
    student    = get_or_create_student(chat.student_name)
    student_id = student["id"]

    if retrieved_chunks:
        primary_topic = retrieved_chunks[0]["topic"]  # highest-relevance chunk
        upsert_topic_stat(student_id, primary_topic)
    else:
        primary_topic = None

    # 4. Build conversation history context
    history = get_message_history(student_id, limit=10)
    history_context = summarise_history(history)

    # 5. Build system prompt with RAG context injected
    system_prompt = build_system_prompt(
        student_name=chat.student_name,
        learning_mode=chat.learning_mode,
        rag_context=rag_context,
        conversation_summary=history_context,
        language=chat.language,
    )

    # 6. LLM call
    messages_payload = [{"role": "system", "content": system_prompt}] + conversation

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=messages_payload,
        temperature=0.7,
        max_tokens=400,
    )
    answer = response.choices[0].message.content

    # 7. Persist messages and add points
    save_message(student_id, "user",      last_message, primary_topic)
    save_message(student_id, "assistant", answer,       primary_topic)
    add_points(student_id, 5) # 5 points per interaction

    return ChatResponse(
        answer=answer,
        topic=primary_topic,
        retrieved_chunks=[
            {"topic": c["topic"], "chunk_type": c["chunk_type"], "score": c["score"]}
            for c in retrieved_chunks
        ],
        retrieval_scores=[c["score"] for c in retrieved_chunks],
    )


@app.get("/quiz/{student_name}", response_model=QuizResponse)
def get_quiz(student_name: str):
    student = get_or_create_student(student_name)
    stats   = get_topic_stats(student["id"])

    if not stats:
        raise HTTPException(status_code=404, detail="No topic history yet. Start chatting first!")

    # Pick from top-3 weakest topics
    weak_topic = random.choice(stats[:3])["topic"]
    top_count  = stats[0]["count"]
    difficulty = "hard" if top_count > 5 else ("medium" if top_count > 2 else "easy")

    quiz_json = generate_quiz(weak_topic, difficulty)

    return QuizResponse(topic=weak_topic, difficulty=difficulty, quiz=quiz_json)


@app.get("/progress/{student_name}", response_model=ProgressResponse)
def get_progress(student_name: str):
    student  = get_or_create_student(student_name)
    stats    = get_topic_stats(student["id"])
    history  = get_message_history(student["id"], limit=200)
    msg_count = len([m for m in history if m["role"] == "user"])
    return ProgressResponse(
        student_name=student_name,
        topic_stats=stats,
        message_count=msg_count,
    )


@app.get("/leaderboard")
def api_get_leaderboard():
    leaders = get_leaderboard(10)
    return {"leaderboard": leaders}

@app.delete("/reset/{student_name}")
def reset_student(student_name: str):
    student = get_or_create_student(student_name)
    delete_student_messages(student["id"])
    return {"message": f"Session reset for {student_name}"}


@app.get("/rag/stats")
def rag_stats():
    """Debug endpoint: inspect ChromaDB collection info."""
    collection = rag_engine._get_collection()
    return {
        "collection": collection.name,
        "total_chunks": collection.count(),
        "embed_model": "all-MiniLM-L6-v2",
        "similarity_metric": "cosine",
    }


@app.post("/rag/search")
def rag_search(payload: dict):
    """Debug endpoint: run a raw semantic search and see retrieved chunks."""
    query = payload.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="query field required")
    chunks = rag_engine.retrieve(query, top_k=payload.get("top_k", 4))
    return {"query": query, "results": chunks}