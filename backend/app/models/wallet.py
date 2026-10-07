import enum
from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class TransactionTypeEnum(str, enum.Enum):
    credit = "credit"
    debit = "debit"

class Wallet(Base):
    __tablename__ = "wallets"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    balance: Mapped[float] = mapped_column(Float, default=0.00, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="INR", nullable=False)

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    wallet_id: Mapped[str] = mapped_column(ForeignKey("wallets.user_id", ondelete="CASCADE"), nullable=False)
    type: Mapped[TransactionTypeEnum] = mapped_column(Enum(TransactionTypeEnum), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(String, nullable=False)
    ride_id: Mapped[str] = mapped_column(ForeignKey("rides.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")
    ride = relationship("Ride")
