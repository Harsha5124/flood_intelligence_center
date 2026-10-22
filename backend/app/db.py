import sqlite3
import hashlib
import json
from datetime import datetime
from .config import settings

def get_db():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'analyst',
        department TEXT DEFAULT 'Disaster Management',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Alerts / Early Warnings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        basin_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        trigger_metric TEXT,
        trigger_value REAL,
        recommended_action TEXT,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        escalated_at TEXT,
        acknowledged INTEGER DEFAULT 0
    )
    """)
    
    # Notifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        basin_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Predictions history
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        basin_id TEXT NOT NULL,
        rainfall_24h REAL NOT NULL,
        forecast_rain REAL NOT NULL,
        river_level REAL NOT NULL,
        predicted_level REAL NOT NULL,
        flood_probability REAL NOT NULL,
        risk_category TEXT NOT NULL,
        drivers TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Seed default admin user if not exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@hydron.gov.in",))
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, department)
        VALUES (?, ?, ?, ?, ?)
        """, (
            "admin@hydron.gov.in",
            hash_password("Admin@1234"),
            "Dr. K. Senthil Nathan, IAS",
            "State Disaster Operations Chief & Super Admin",
            "TN Disaster Management Authority (TNDMA)"
        ))

    # Seed demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("demo@hydron.app",))
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, department)
        VALUES (?, ?, ?, ?, ?)
        """, (
            "demo@hydron.app",
            hash_password("Demo@1234"),
            "Dr. M. Krishnan",
            "Chief Hydrology Officer",
            "State Disaster Management Authority"
        ))
        
    # Seed sample initial notifications & alerts if empty
    cursor.execute("SELECT COUNT(*) FROM notifications")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_notifications = [
            ("notif-01", "adyar", "WARNING", "THRESHOLD_CROSSING", "River Level Rising Near Saidapet", "Adyar river gauge at Saidapet reached 2.85m, crossing the Warning Mark of 2.50m.", 0, now_str),
            ("notif-02", "adyar", "CRITICAL", "ESCALATION", "Chembarambakkam Discharge Increase", "Outflow increased to 3,200 cusecs due to continuous catchment inflow.", 0, now_str),
            ("notif-03", "cooum", "WATCH", "WEATHER_UPDATE", "Moderate Rainfall Influx Recorded", "Cooum upper catchment recorded 38mm rainfall in the past 12 hours.", 1, now_str)
        ]
        cursor.executemany("""
        INSERT INTO notifications (id, basin_id, severity, event_type, title, message, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_notifications)

    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        initial_alerts = [
            ("alt-01", "adyar", "WARNING", "Adyar River Warning Level Exceeded", 
             "Water level at Saidapet Bridge is 2.85m (Warning mark: 2.50m, Danger mark: 3.50m). Chembarambakkam reservoir storage is at 82.8%. Low-lying riverside zones in Saidapet, Jafferkhanpet, and Kotturpuram must prepare for waterlogging.",
             "river_level_m", 2.85, "Deploy evacuation teams to Saidapet & Kotturpuram relief centres; activate emergency boat patrols.", "ACTIVE", now_str),
            ("alt-02", "cooum", "WATCH", "Cooum River Watch Stage", 
             "Catchment soil moisture high following 35mm precipitation. Current river level at 1.95m (Warning threshold: 2.20m). Flow remains contained within banks.",
             "soil_saturation", 0.72, "Monitor Korattur Anaicut and Koyambedu bridges hourly.", "ACTIVE", now_str)
        ]
        cursor.executemany("""
        INSERT INTO alerts (id, basin_id, severity, title, message, trigger_metric, trigger_value, recommended_action, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_alerts)

    conn.commit()
    conn.close()

# Auto initialize DB on module import
init_db()
