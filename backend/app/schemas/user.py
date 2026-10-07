from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.user import RoleEnum

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: RoleEnum = RoleEnum.user

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    is_active: Optional[bool] = None

class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: RoleEnum
    is_active: bool
    created_at: datetime
        
class DriverProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_type: str
    vehicle_number: str
    license_number: str
    is_online: bool
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    rating: float
    is_verified: bool
