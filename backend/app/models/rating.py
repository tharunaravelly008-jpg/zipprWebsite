from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Rating(Base):
    __tablename__ = "ratings"

    ride_id: Mapped[str] = mapped_column(ForeignKey("rides.id", ondelete="CASCADE"), primary_key=True)
    rated_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    rated_user: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(String, nullable=True)

    # Relationships
    ride = relationship("Ride", back_populates="ratings")
    rater = relationship("User", foreign_keys=[rated_by])
    ratee = relationship("User", foreign_keys=[rated_user])
