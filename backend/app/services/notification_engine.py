import uuid
from datetime import datetime, timedelta
from ..db import get_db

class NotificationEngine:
    def __init__(self):
        # Keeps track of last notification time per (basin_id, event_type, severity)
        self._cooldown_cache = {}
        self.COOLDOWN_MINUTES = 60 # minimum 1 hour between duplicate alert notifications

    def trigger_event(self, basin_id: str, severity: str, event_type: str, title: str, message: str):
        basin_key = basin_id.lower()
        cache_key = f"{basin_key}:{event_type}:{severity}"
        now = datetime.now()
        
        # Check cooldown
        if cache_key in self._cooldown_cache:
            last_sent = self._cooldown_cache[cache_key]
            if (now - last_sent) < timedelta(minutes=self.COOLDOWN_MINUTES) and severity != "CRITICAL":
                # Skip duplicate notification
                return None
                
        self._cooldown_cache[cache_key] = now
        
        # Save to DB
        notif_id = f"notif-{uuid.uuid4().hex[:8]}"
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO notifications (id, basin_id, severity, event_type, title, message, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        """, (notif_id, basin_key, severity, event_type, title, message, now_str))
        conn.commit()
        conn.close()
        
        return {
            "id": notif_id,
            "basin_id": basin_key,
            "severity": severity,
            "event_type": event_type,
            "title": title,
            "message": message,
            "is_read": False,
            "created_at": now_str
        }

    def get_notifications(self, limit: int = 30):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, basin_id, severity, event_type, title, message, is_read, created_at
        FROM notifications
        ORDER BY created_at DESC
        LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def get_unread_count(self) -> int:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM notifications WHERE is_read = 0")
        count = cursor.fetchone()[0]
        conn.close()
        return count

    def mark_as_read(self, notif_id: str):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notif_id,))
        conn.commit()
        conn.close()

    def mark_all_read(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1")
        conn.commit()
        conn.close()

notification_engine = NotificationEngine()
