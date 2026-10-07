from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.wallet import TransactionTypeEnum

class WalletRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    balance: float
    currency: str

class AddMoneyRequest(BaseModel):
    amount: float
    method: str = "wallet"

class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    wallet_id: str
    type: TransactionTypeEnum
    amount: float
    reason: str
    ride_id: Optional[str] = None
    created_at: datetime
