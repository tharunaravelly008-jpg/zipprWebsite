import asyncio
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.base import Base, engine
from app.db.session import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, RoleEnum
from app.models.driver_profile import DriverProfile, VehicleTypeEnum
from app.models.wallet import Wallet, WalletTransaction, TransactionTypeEnum
from app.models.ride import Ride, RideStatusEnum, RideStatusEvent
from app.models.blog import BlogPost

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zippr-seed")

async def seed_data(session: AsyncSession):
    logger.info("Starting database seeding...")

    # Clear existing tables safely
    # (Optional, but useful for a reset script. Let's just inspect if seed is already run)
    result = await session.execute(select(User).limit(1))
    if result.scalars().first():
        logger.info("Database already has records. Skipping seeding.")
        return

    # 1. Create Users
    password_hash_rider = hash_password("Rider@123")
    password_hash_driver = hash_password("Driver@123")
    password_hash_admin = hash_password("Admin@123")

    riders = [
        User(
            id="rider-uuid-priya",
            name="Priya Sharma",
            email="priya@example.com",
            phone="9876543210",
            password_hash=password_hash_rider,
            role=RoleEnum.user,
            is_active=True
        ),
        User(
            id="rider-uuid-rahul",
            name="Rahul Verma",
            email="rahul@example.com",
            phone="9876543211",
            password_hash=password_hash_rider,
            role=RoleEnum.user,
            is_active=True
        )
    ]

    drivers = [
        User(
            id="driver-uuid-arjun",
            name="Arjun Singh",
            email="arjun.partner@zippr.app",
            phone="9876543212",
            password_hash=password_hash_driver,
            role=RoleEnum.driver,
            is_active=True
        ),
        User(
            id="driver-uuid-sunita",
            name="Sunita Rao",
            email="sunita.partner@zippr.app",
            phone="9876543213",
            password_hash=password_hash_driver,
            role=RoleEnum.driver,
            is_active=True
        )
    ]

    admin = User(
        id="admin-uuid-ops",
        name="Admin Ops",
        email="admin@zippr.app",
        phone="9876543214",
        password_hash=password_hash_admin,
        role=RoleEnum.admin,
        is_active=True
    )

    session.add_all(riders + drivers + [admin])
    await session.flush() # flush to persist users for foreign key references

    # 2. Create Wallets
    wallets = [
        Wallet(user_id="rider-uuid-priya", balance=500.00, currency="INR"),
        Wallet(user_id="rider-uuid-rahul", balance=50.00, currency="INR"),
        Wallet(user_id="driver-uuid-arjun", balance=0.00, currency="INR"),
        Wallet(user_id="driver-uuid-sunita", balance=150.00, currency="INR"),
        Wallet(user_id="admin-uuid-ops", balance=10000.00, currency="INR"),
    ]
    session.add_all(wallets)

    # 3. Create Driver Profiles
    driver_profiles = [
        DriverProfile(
            user_id="driver-uuid-arjun",
            vehicle_type=VehicleTypeEnum.bike,
            vehicle_number="DL 3S AB 1234",
            license_number="DL-14202300483",
            is_online=True,
            current_lat=28.6139,
            current_lng=77.2090,
            rating=4.8,
            is_verified=True
        ),
        DriverProfile(
            user_id="driver-uuid-sunita",
            vehicle_type=VehicleTypeEnum.auto,
            vehicle_number="KA 51 X 9876",
            license_number="KA-51202200921",
            is_online=False,
            current_lat=12.9716,
            current_lng=77.5946,
            rating=4.9,
            is_verified=True
        )
    ]
    session.add_all(driver_profiles)
    await session.flush()

    # 4. Create Rides
    rides = [
        Ride(
            id="ride-completed-1",
            rider_id="rider-uuid-priya",
            driver_id="driver-uuid-arjun",
            pickup_lat=28.6139,
            pickup_lng=77.2090,
            drop_lat=28.6250,
            drop_lng=77.2200,
            vehicle_type="bike",
            status=RideStatusEnum.completed,
            fare_estimate=55.00,
            fare_final=55.00,
            distance_km=2.4,
            requested_at=datetime.now(timezone.utc) - timedelta(hours=2),
            started_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=10),
            completed_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=55)
        ),
        Ride(
            id="ride-cancelled-1",
            rider_id="rider-uuid-rahul",
            driver_id=None,
            pickup_lat=12.9716,
            pickup_lng=77.5946,
            drop_lat=12.9900,
            drop_lng=77.6100,
            vehicle_type="cab",
            status=RideStatusEnum.cancelled,
            fare_estimate=180.00,
            distance_km=4.8,
            requested_at=datetime.now(timezone.utc) - timedelta(hours=1)
        )
    ]
    session.add_all(rides)

    # 5. Create Blog Posts
    posts = [
        BlogPost(
            title="Introducing Zippr: Your Premium City Commute Companion",
            slug="introducing-zippr-premium-city-commute",
            content="Welcome to the next generation of ride-booking in India. Zippr leverages advanced GPS dispatching and deep-indigo styling grids to provide the smoothest bike, auto, and cab booking interface.",
            author="Zippr Editorial Team"
        ),
        BlogPost(
            title="Safe Transit: How Zippr Verifies Every Partner",
            slug="safe-transit-zippr-partner-verification",
            content="Safety is our absolute cornerstone. Every partner on our platform undergoes extensive background checks, driver license verification, and vehicle safety inspections before their first dispatch.",
            author="Zippr Ops Team"
        )
    ]
    session.add_all(posts)

    await session.commit()
    logger.info("Database seeding successfully completed!")

async def main():
    async with AsyncSessionLocal() as session:
        await seed_data(session)

if __name__ == "__main__":
    asyncio.run(main())
