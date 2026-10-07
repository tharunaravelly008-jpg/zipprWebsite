import enum
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class RideStatusEnum(str, enum.Enum):
    requested = "requested"
    accepted = "accepted"
    ongoing = "ongoing"
    completed = "completed"
    cancelled = "cancelled"

class Ride(Base):
    __tablename__ = "rides"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    rider_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    driver_id: Mapped[str] = mapped_column(ForeignKey("driver_profiles.user_id"), nullable=True, index=True)
    pickup_lat: Mapped[float] = mapped_column(Float, nullable=False)
    pickup_lng: Mapped[float] = mapped_column(Float, nullable=False)
    drop_lat: Mapped[float] = mapped_column(Float, nullable=False)
    drop_lng: Mapped[float] = mapped_column(Float, nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[RideStatusEnum] = mapped_column(Enum(RideStatusEnum), default=RideStatusEnum.requested, nullable=False, index=True)
    fare_estimate: Mapped[float] = mapped_column(Float, nullable=False)
    fare_final: Mapped[float] = mapped_column(Float, nullable=True)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    rider = relationship("User", foreign_keys=[rider_id], back_populates="rides_as_rider")
    driver = relationship("DriverProfile", foreign_keys=[driver_id], back_populates="rides_as_driver")
    events = relationship("RideStatusEvent", back_populates="ride", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="ride", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="ride", cascade="all, delete-orphan")

class RideStatusEvent(Base):
    __tablename__ = "ride_status_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ride_id: Mapped[str] = mapped_column(ForeignKey("rides.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[RideStatusEnum] = mapped_column(Enum(RideStatusEnum), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    ride = relationship("Ride", back_populates="events")
