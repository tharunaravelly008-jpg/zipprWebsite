from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.deps import get_current_user, get_db, require_role
from app.models.user import User, RoleEnum
from app.models.driver_profile import DriverProfile
from app.schemas.user import DriverProfileRead
from app.schemas.common import StatusOkResponse

router = APIRouter(prefix="/drivers", tags=["drivers"])

@router.get("/me", response_model=DriverProfileRead)
async def get_driver_profile(
    current_user: User = Depends(require_role(["driver"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves Partner specific vehicle and status profile."""
    result = await db.execute(select(DriverProfile).where(DriverProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner profile not created. Contact support."
        )
    return profile

@router.patch("/me/status", response_model=DriverProfileRead)
async def update_online_status(
    is_online: bool,
    current_user: User = Depends(require_role(["driver"])),
    db: AsyncSession = Depends(get_db)
):
    """Toggles online/offline availability status."""
    result = await db.execute(select(DriverProfile).where(DriverProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Partner profile not found")
        
    profile.is_online = is_online
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile

@router.patch("/me/location", response_model=StatusOkResponse)
async def update_gps_location(
    lat: float,
    lng: float,
    current_user: User = Depends(require_role(["driver"])),
    db: AsyncSession = Depends(get_db)
):
    """Updates active latitude/longitude GPS position."""
    result = await db.execute(select(DriverProfile).where(DriverProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Partner profile not found")
        
    profile.current_lat = lat
    profile.current_lng = lng
    db.add(profile)
    await db.commit()
    return StatusOkResponse(status="ok")
