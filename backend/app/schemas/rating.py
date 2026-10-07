from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class RatingCreate(BaseModel):
    stars: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    comment: Optional[str] = Field(None, max_length=500, description="Optional text feedback")

class RatingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ride_id: str
    rated_by: str
    rated_user: str
    stars: int
    comment: Optional[str]
