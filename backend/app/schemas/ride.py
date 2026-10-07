from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.ride import RideStatusEnum

class FareEstimateRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float

class FareEstimate(BaseModel):
    vehicle_type: str
    fare_estimate: float
    duration_mins: float
    distance_km: float

class RideCreate(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    vehicle_type: str
    fare_estimate: float

class RideStatusUpdate(BaseModel):
    status: RideStatusEnum

class RideRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    rider_id: str
    driver_id: Optional[str] = None
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    vehicle_type: str
    status: RideStatusEnum
    fare_estimate: float
    fare_final: Optional[float] = None
    distance_km: float
    requested_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
