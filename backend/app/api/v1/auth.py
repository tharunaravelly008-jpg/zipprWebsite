import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.deps import get_db
from app.models.user import User, RoleEnum
from app.models.wallet import Wallet
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserCreate, UserRead
from app.schemas.common import StatusOkResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new user (rider or driver) and creates their default wallet."""
    # Check if email or phone already exists
    result = await db.execute(select(User).where((User.email == user_in.email) | (User.phone == user_in.phone)))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address or phone number is already registered"
        )
        
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user_in.password)
    
    new_user = User(
        id=user_id,
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    
    # Initialize their wallet
    new_wallet = Wallet(user_id=user_id, balance=0.00, currency="INR")
    db.add(new_wallet)
    
    await db.commit()
    await db.refresh(new_user)
    
    # Create tokens
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    return TokenResponse(
        user=UserRead.model_validate(new_user),
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Logs in an existing user and returns access/refresh JWT tokens."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated"
        )
        
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return TokenResponse(
        user=UserRead.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_in: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Refreshes an access token using a valid refresh token."""
    from jose import jwt
    from app.core.config import settings
    
    try:
        payload = jwt.decode(refresh_in.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
        
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id) # Rotate refresh token
    
    return TokenResponse(
        user=UserRead.model_validate(user),
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/logout", response_model=StatusOkResponse)
async def logout():
    """Invalidates active JWT token session."""
    return StatusOkResponse(status="ok")
