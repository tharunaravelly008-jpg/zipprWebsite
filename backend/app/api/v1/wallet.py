from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.wallet import Wallet, WalletTransaction, TransactionTypeEnum
from app.schemas.wallet import WalletRead, AddMoneyRequest, TransactionRead

router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.get("", response_model=WalletRead)
async def get_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves current user's wallet info and balance."""
    result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not initialized")
    return wallet

@router.post("/add-money", response_model=WalletRead)
async def add_money(
    req: AddMoneyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Recharges user's wallet account balance."""
    if req.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be positive")

    result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        # Create wallet if missing
        wallet = Wallet(user_id=current_user.id, balance=0.00, currency="INR")
        db.add(wallet)
        
    wallet.balance += req.amount
    db.add(wallet)

    # Write immutable ledger record
    tx = WalletTransaction(
        wallet_id=current_user.id,
        type=TransactionTypeEnum.credit,
        amount=req.amount,
        reason=f"Add funds via {req.method}"
    )
    db.add(tx)
    
    await db.commit()
    await db.refresh(wallet)
    return wallet

@router.get("/transactions", response_model=List[TransactionRead])
async def get_wallet_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all wallet balance adjustments and ride charges logs."""
    result = await db.execute(
        select(WalletTransaction)
        .where(WalletTransaction.wallet_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
    )
    transactions = result.scalars().all()
    return transactions
