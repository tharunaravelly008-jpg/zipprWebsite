import enum
from sqlalchemy import String, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class VehicleTypeEnum(str, enum.Enum):
    bike = "bike"
    auto = "auto"
    cab = "cab"

class DriverProfile(Base):
    __tablename__ = "driver_profiles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    vehicle_type: Mapped[VehicleTypeEnum] = mapped_column(String, nullable=False)
    vehicle_number: Mapped[str] = mapped_column(String, nullable=False)
    license_number: Mapped[str] = mapped_column(String, nullable=False)
    is_online: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    current_lat: Mapped[float] = mapped_column(Float, nullable=True)
    current_lng: Mapped[float] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="driver_profile")
    rides_as_driver = relationship("Ride", foreign_keys="[Ride.driver_id]", back_populates="driver")
