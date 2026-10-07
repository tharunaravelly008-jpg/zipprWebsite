import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.core.deps import get_current_user, get_db, require_role
from app.models.user import User, RoleEnum
from app.models.ride import Ride, RideStatusEnum, RideStatusEvent
from app.models.driver_profile import DriverProfile
from app.models.rating import Rating
from app.schemas.ride import FareEstimateRequest, FareEstimate, RideCreate, RideStatusUpdate, RideRead
from app.schemas.rating import RatingCreate, RatingRead
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/rides", tags=["rides"])

@router.post("/estimate", response_model=List[FareEstimate])
async def get_fare_estimates(
    req: FareEstimateRequest,
    current_user: User = Depends(get_current_user)
):
    """Calculates estimates base rates, distances, travel speeds, and surges server-side."""
    # Simulating base fare math based on mock linear distance calculation
    import math
    lat_diff = req.drop_lat - req.pickup_lat
    lng_diff = req.drop_lng - req.pickup_lng
    distance = math.sqrt(lat_diff**2 + lng_diff**2) * 111.0 # crude approximation
    if distance < 1.0:
        distance = 1.2
        
    duration = distance * 2.5 # approx 2.5 minutes per km
    
    # Fare formulas: base + (dist * dist_rate) + (dur * dur_rate)
    estimates = [
        FareEstimate(
            vehicle_type="bike",
            fare_estimate=round(20.0 + (distance * 8.0) + (duration * 1.5), 2),
            duration_mins=round(duration, 1),
            distance_km=round(distance, 1)
        ),
        FareEstimate(
            vehicle_type="auto",
            fare_estimate=round(35.0 + (distance * 12.0) + (duration * 2.0), 2),
            duration_mins=round(duration, 1),
            distance_km=round(distance, 1)
        ),
        FareEstimate(
            vehicle_type="cab",
            fare_estimate=round(60.0 + (distance * 18.0) + (duration * 3.0), 2),
            duration_mins=round(duration, 1),
            distance_km=round(distance, 1)
        )
    ]
    return estimates

@router.post("", response_model=RideRead, status_code=status.HTTP_201_CREATED)
async def create_ride_booking(
    ride_in: RideCreate,
    current_user: User = Depends(require_role(["user"])),
    db: AsyncSession = Depends(get_db)
):
    """Submits a new ride-hailing request into the system dispatch pool."""
    # Simple direct distance approximation for database persist
    import math
    lat_diff = ride_in.drop_lat - ride_in.pickup_lat
    lng_diff = ride_in.drop_lng - ride_in.pickup_lng
    distance = max(0.5, math.sqrt(lat_diff**2 + lng_diff**2) * 111.0)

    ride_id = str(uuid.uuid4())
    new_ride = Ride(
        id=ride_id,
        rider_id=current_user.id,
        driver_id=None,
        pickup_lat=ride_in.pickup_lat,
        pickup_lng=ride_in.pickup_lng,
        drop_lat=ride_in.drop_lat,
        drop_lng=ride_in.drop_lng,
        vehicle_type=ride_in.vehicle_type,
        status=RideStatusEnum.requested,
        fare_estimate=ride_in.fare_estimate,
        distance_km=round(distance, 2)
    )
    db.add(new_ride)
    
    # Audit status event trail
    audit_event = RideStatusEvent(
        ride_id=ride_id,
        status=RideStatusEnum.requested
    )
    db.add(audit_event)
    
    await db.commit()
    await db.refresh(new_ride)
    return new_ride

@router.get("/available", response_model=PaginatedResponse[RideRead])
async def get_available_rides(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role(["driver"])),
    db: AsyncSession = Depends(get_db)
):
    """Fetches rides that are currently 'requested' and have no driver assigned."""
    query = select(Ride).where(Ride.status == RideStatusEnum.requested, Ride.driver_id == None)
    
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()
    
    result = await db.execute(query.order_by(Ride.requested_at.asc()).offset(offset).limit(limit))
    items = result.scalars().all()
    
    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/{id}", response_model=RideRead)
async def get_ride(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches details and status indicators of a specific ride."""
    result = await db.execute(select(Ride).where(Ride.id == id))
    ride = result.scalar_one_or_none()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride booking not found")
        
    # Enforce access permissions (only rider, driver, or admin can read)
    if current_user.role == RoleEnum.user and ride.rider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this ride details")
    if current_user.role == RoleEnum.driver and (ride.driver_id != current_user.id and ride.status != RideStatusEnum.requested):
        raise HTTPException(status_code=403, detail="Not authorized to access this ride details")
        
    return ride

@router.patch("/{id}/status", response_model=RideRead)
async def update_ride_status(
    id: str,
    status_update: RideStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates status transitions: accepted, arrived, ongoing, completed, cancelled."""
    result = await db.execute(select(Ride).where(Ride.id == id))
    ride = result.scalar_one_or_none()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride booking not found")

    # Simple RBAC/state-machine stubs
    if status_update.status == RideStatusEnum.accepted:
        if current_user.role != RoleEnum.driver:
            raise HTTPException(status_code=403, detail="Only Partners can accept rides")
        ride.driver_id = current_user.id
        
    ride.status = status_update.status
    if status_update.status == RideStatusEnum.ongoing:
        ride.started_at = datetime.now(timezone.utc)
    elif status_update.status == RideStatusEnum.completed:
        ride.completed_at = datetime.now(timezone.utc)
        ride.fare_final = ride.fare_estimate

    # Record status transition event log
    db.add(RideStatusEvent(ride_id=id, status=status_update.status))
    db.add(ride)
    await db.commit()
    await db.refresh(ride)
    return ride

@router.get("", response_model=PaginatedResponse[RideRead])
async def get_rides_history(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves paginated search lists of active and historic ride bookings."""
    query = select(Ride)
    if current_user.role == RoleEnum.user:
        query = query.where(Ride.rider_id == current_user.id)
    elif current_user.role == RoleEnum.driver:
        query = query.where(Ride.driver_id == current_user.id)
        
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar_one()
    
    # Fetch chunk
    result = await db.execute(query.order_by(Ride.requested_at.desc()).offset(offset).limit(limit))
    items = result.scalars().all()
    
    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )

@router.post("/{id}/rate", response_model=RatingRead)
async def rate_ride(
    id: str,
    rating_in: RatingCreate,
    current_user: User = Depends(require_role(["user"])),
    db: AsyncSession = Depends(get_db)
):
    """Submit a star rating and comment for a completed ride."""
    result = await db.execute(select(Ride).where(Ride.id == id))
    ride = result.scalar_one_or_none()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.rider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to rate this ride")
    if ride.status != RideStatusEnum.completed:
        raise HTTPException(status_code=400, detail="Can only rate completed rides")
    if not ride.driver_id:
        raise HTTPException(status_code=400, detail="No driver was assigned to this ride")

    # Check if already rated
    existing_rating = await db.execute(select(Rating).where(Rating.ride_id == id))
    if existing_rating.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ride has already been rated")

    new_rating = Rating(
        ride_id=id,
        rated_by=current_user.id,
        rated_user=ride.driver_id,
        stars=rating_in.stars,
        comment=rating_in.comment
    )
    db.add(new_rating)
    
    # Update driver's average rating
    # Recompute average
    avg_query = select(func.avg(Rating.stars)).where(Rating.rated_user == ride.driver_id)
    # We must commit or flush to include the new rating in the avg query
    await db.flush() 
    avg_result = await db.execute(avg_query)
    new_avg = avg_result.scalar()
    
    # Update driver profile
    driver_prof_res = await db.execute(select(DriverProfile).where(DriverProfile.user_id == ride.driver_id))
    driver_prof = driver_prof_res.scalar_one_or_none()
    if driver_prof:
        driver_prof.rating = float(new_avg) if new_avg else 0.0
        db.add(driver_prof)

    await db.commit()
    await db.refresh(new_rating)
    return new_rating

