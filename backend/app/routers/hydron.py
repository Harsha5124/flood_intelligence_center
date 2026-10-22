from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from ..services.hydron_assistant import process_hydron_query
from ..db import get_db

router = APIRouter(prefix="/hydron", tags=["Hydron AI Assistant"])

class ChatMessageRequest(BaseModel):
    message: str
    basin: str = "adyar"

@router.post("/chat")
def hydron_chat(req: ChatMessageRequest):
    result = process_hydron_query(query=req.message, basin_context=req.basin)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Audit chat log into DB
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT,
            bot_response TEXT,
            is_relevant INTEGER,
            topic TEXT,
            created_at TEXT
        )
        """)
        cursor.execute("""
        INSERT INTO chat_log (user_message, bot_response, is_relevant, topic, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (req.message, result["response"], 1 if result["is_domain_relevant"] else 0, result["topic"], now_str))
        conn.commit()
        conn.close()
    except Exception:
        pass
        
    result["timestamp"] = now_str
    return result
