from fastapi import APIRouter
from pydantic import BaseModel
from ..services.notification_engine import notification_engine

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class ManualAlertTrigger(BaseModel):
    basin_id: str = "adyar"
    severity: str = "CRITICAL"
    event_type: str = "USER_DISPATCH_ALERT"
    title: str = "Urgent Flood Evacuation Broadcast"
    message: str = "Emergency flood alert dispatched by analyst following ML prediction spike. Immediate riverbank clearance requested."

@router.get("")
def list_notifications():
    return notification_engine.get_notifications(limit=50)

@router.get("/unread-count")
def get_unread():
    return {"unread_count": notification_engine.get_unread_count()}

@router.post("/{notif_id}/read")
def mark_read(notif_id: str):
    notification_engine.mark_as_read(notif_id)
    return {"status": "success", "id": notif_id}

@router.post("/mark-all-read")
def mark_all_read():
    notification_engine.mark_all_read()
    return {"status": "success"}

@router.post("/trigger-alert")
def trigger_alert(req: ManualAlertTrigger):
    """Allows user to dispatch an instant operational flood alert broadcast from prediction."""
    res = notification_engine.trigger_event(
        basin_id=req.basin_id,
        severity=req.severity,
        event_type=req.event_type,
        title=req.title,
        message=req.message
    )
    return {
        "status": "broadcast_dispatched",
        "notification": res or {"message": "Notification broadcast created successfully"}
    }
