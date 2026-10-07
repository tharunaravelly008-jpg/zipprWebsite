import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.ride import Ride, RideStatusEnum
from app.models.payment import Payment, PaymentMethodEnum, PaymentStatusEnum
from app.models.wallet import Wallet, WalletTransaction, TransactionTypeEnum

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/process", status_code=status.HTTP_200_OK)
async def process_payment(
    ride_id: str,
    method: PaymentMethodEnum,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Processes payments for a completed ride. Intercepts wallet ledger transfers."""
    result = await db.execute(select(Ride).where(Ride.id == ride_id))
    ride = result.scalar_one_or_none()
    
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.rider_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this ride")
        
    amount_to_charge = ride.fare_estimate
    
    # Process wallet transaction transfer if selected
    if method == PaymentMethodEnum.wallet:
        result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
        wallet = result.scalar_one_or_none()
        if not wallet or wallet.balance < amount_to_charge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient funds in digital wallet. Recharge or select cash."
            )
            
        wallet.balance -= amount_to_charge
        db.add(wallet)
        
        # Write to immutable wallet transaction log
        wallet_tx = WalletTransaction(
            wallet_id=wallet.user_id,
            type=TransactionTypeEnum.debit,
            amount=amount_to_charge,
            reason=f"Ride payment for Zippr {ride.id}",
            ride_id=ride.id
        )
        db.add(wallet_tx)
        
    # Create persistent payment log
    payment = Payment(
        id=str(uuid.uuid4()),
        ride_id=ride.id,
        amount=amount_to_charge,
        method=method,
        status=PaymentStatusEnum.success,
        transaction_ref=f"tx_{uuid.uuid4().hex[:12]}"
    )
    db.add(payment)
    
    # Update ride status to indicate it's settled
    ride.status = RideStatusEnum.completed
    db.add(ride)
    
    await db.commit()
    return {"status": "success", "amount": amount_to_charge, "reference": payment.transaction_ref}
