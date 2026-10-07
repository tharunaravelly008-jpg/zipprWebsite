from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.drivers import router as drivers_router
from app.api.v1.rides import router as rides_router
from app.api.v1.payments import router as payments_router
from app.api.v1.wallet import router as wallet_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router
from app.api.v1.tracking import router as tracking_router


api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(drivers_router)
api_router.include_router(rides_router)
api_router.include_router(payments_router)
api_router.include_router(wallet_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_router)
api_router.include_router(tracking_router)

