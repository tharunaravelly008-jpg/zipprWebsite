from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.deps import get_db, require_role
from app.models.user import User
from app.models.driver_profile import DriverProfile
from app.models.ride import Ride
from app.models.payment import Payment

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/analytics/summary")
async def get_analytics_summary(
    admin: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves operational aggregates for admin monitoring."""
    # Count totals
    total_riders_result = await db.execute(select(func.count(User.id)).where(User.role == "user"))
    total_riders = total_riders_result.scalar_one()

    total_drivers_result = await db.execute(select(func.count(User.id)).where(User.role == "driver"))
    total_drivers = total_drivers_result.scalar_one()

    active_rides_result = await db.execute(
        select(func.count(Ride.id)).where(Ride.status.in_(["requested", "accepted", "ongoing"]))
    )
    active_rides = active_rides_result.scalar_one()

    earnings_result = await db.execute(select(func.sum(Payment.amount)).where(Payment.status == "success"))
    total_earnings = earnings_result.scalar_one() or 0.00

    return {
        "total_riders": total_riders,
        "total_drivers": total_drivers,
        "active_rides": active_rides,
        "total_earnings": float(total_earnings),
    }

@router.get("/users")
async def list_users(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Lists users on the platform."""
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        } for u in users
    ]

@router.get("/drivers")
async def list_drivers(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Lists driver profiles."""
    result = await db.execute(
        select(DriverProfile).offset(offset).limit(limit)
    )
    drivers = result.scalars().all()
    return [
        {
            "user_id": d.user_id,
            "vehicle_type": d.vehicle_type,
            "vehicle_number": d.vehicle_number,
            "license_number": d.license_number,
            "is_online": d.is_online,
            "rating": d.rating,
            "is_verified": d.is_verified
        } for d in drivers
    ]

@router.get("/rides")
async def list_rides(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Lists all rides."""
    result = await db.execute(
        select(Ride).order_by(Ride.requested_at.desc()).offset(offset).limit(limit)
    )
    rides = result.scalars().all()
    return [
        {
            "id": r.id,
            "rider_id": r.rider_id,
            "driver_id": r.driver_id,
            "pickup_lat": r.pickup_lat,
            "pickup_lng": r.pickup_lng,
            "drop_lat": r.drop_lat,
            "drop_lng": r.drop_lng,
            "vehicle_type": r.vehicle_type,
            "status": r.status,
            "fare_estimate": r.fare_estimate,
            "distance_km": r.distance_km,
            "requested_at": r.requested_at
        } for r in rides
    ]
