from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.common import StatusOkResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves list of user alerts."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    items = result.scalars().all()
    # Pydantic schemas can validate models dynamically. Since notifications is simple:
    return [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at
        } for n in items
    ]

@router.patch("/{id}/read", response_model=StatusOkResponse)
async def mark_notification_read(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Marks a notification as read."""
    result = await db.execute(
        select(Notification)
        .where((Notification.id == id) & (Notification.user_id == current_user.id))
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    item.is_read = True
    db.add(item)
    await db.commit()
    return StatusOkResponse(status="ok")

@router.post("/read-all", response_model=StatusOkResponse)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Marks all user's notifications as read."""
    from sqlalchemy import update
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.commit()
    return StatusOkResponse(status="ok")
