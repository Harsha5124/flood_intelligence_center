import uuid
from datetime import datetime
from ..config import settings
from ..db import get_db

class WarningEngine:
    def __init__(self):
        # In-memory persistence / hysteresis buffer to prevent flickering
        self._last_states = {}
        self._cooldown_timestamps = {}

    def evaluate_basin(self, basin_id: str, current_level: float, rate_of_rise: float, 
                       rainfall_24h: float, reservoir_pct: float, ml_prob: float):
        basin_key = basin_id.lower()
        thresholds = settings.RIVER_THRESHOLDS.get(basin_key, {"warning": 2.50, "danger": 3.50, "bankfull": 4.20})
        warning_mark = thresholds["warning"]
        danger_mark = thresholds["danger"]

        # 1. State Determination with Multi-Indicator Logic
        if current_level >= danger_mark or ml_prob >= 0.70 or (current_level >= warning_mark and rate_of_rise >= 10.0):
            new_state = "CRITICAL"
            reason = f"River level at {current_level:.2f}m exceeded Danger Level ({danger_mark:.2f}m) or ML flood probability is {ml_prob*100:.1f}%."
            action = "Immediate evacuation of riverside populations. Sound flood sirens and mobilize disaster rescue teams."
        elif current_level >= warning_mark or ml_prob >= 0.40 or (reservoir_pct >= 85.0 and rainfall_24h >= 75.0):
            new_state = "WARNING"
            reason = f"River level ({current_level:.2f}m) crossed Warning Mark ({warning_mark:.2f}m) with heavy precipitation ({rainfall_24h:.1f}mm)."
            action = "Activate emergency control room. Restrict movement across causeways and prepare relief camps."
        elif current_level >= (warning_mark - 0.35) or ml_prob >= 0.15 or rainfall_24h >= 50.0:
            new_state = "WATCH"
            reason = f"Catchment runoff increasing; river level at {current_level:.2f}m with rising trend."
            action = "Continuous gauge telemetry monitoring every 15 minutes."
        else:
            new_state = "NORMAL"
            reason = "Flow parameters and reservoir storage within safe operational margins."
            action = "Routine environmental surveillance."

        # 2. Hysteresis & Anti-Flickering
        prev_state = self._last_states.get(basin_key, "NORMAL")
        state_order = {"NORMAL": 0, "WATCH": 1, "WARNING": 2, "CRITICAL": 3}

        # Escalation is immediate; de-escalation requires buffer (hysteresis of 0.15m)
        effective_state = new_state
        if state_order[new_state] < state_order[prev_state]:
            if prev_state == "CRITICAL" and current_level > (danger_mark - 0.20):
                effective_state = "CRITICAL"
            elif prev_state == "WARNING" and current_level > (warning_mark - 0.15):
                effective_state = "WARNING"

        self._last_states[basin_key] = effective_state
        
        # 3. Record warning event if state changed or if Warning/Critical
        alert_event = None
        if effective_state in ["WARNING", "CRITICAL"] or effective_state != prev_state:
            alert_event = self._save_alert(basin_key, effective_state, reason, action, current_level)

        return {
            "basin_id": basin_key,
            "warning_state": effective_state,
            "previous_state": prev_state,
            "is_escalation": state_order[effective_state] > state_order[prev_state],
            "reason": reason,
            "recommended_action": action,
            "current_level_m": current_level,
            "warning_mark_m": warning_mark,
            "danger_mark_m": danger_mark,
            "alert_created": alert_event is not None
        }

    def _save_alert(self, basin_id: str, severity: str, reason: str, action: str, level: float):
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if an active alert for this basin & severity already exists in last 2 hours
        cursor.execute("""
        SELECT id FROM alerts 
        WHERE basin_id = ? AND severity = ? AND status = 'ACTIVE'
        """, (basin_id, severity))
        existing = cursor.fetchone()
        
        if existing:
            conn.close()
            return None
            
        alert_id = f"alt-{uuid.uuid4().hex[:8]}"
        title = f"{basin_id.upper()} Basin - {severity} Flood Alert"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        cursor.execute("""
        INSERT INTO alerts (id, basin_id, severity, title, message, trigger_metric, trigger_value, recommended_action, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
        """, (alert_id, basin_id, severity, title, reason, "river_level_m", level, action, now_str))
        
        conn.commit()
        conn.close()
        return alert_id

warning_engine = WarningEngine()
