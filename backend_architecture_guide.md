# 🚕 Zippr Backend — Deep Architecture & Module Workflow Guide
> **Audience:** Engineering team members new to the codebase  
> **Purpose:** Understand every layer of the FastAPI backend — how each module works, why it exists, and how everything connects.

---

## 1. 🗺️ High-Level Architecture Overview

```
HTTP Request
     │
     ▼
┌──────────────────────────────────────────┐
│              main.py                     │
│   FastAPI App + CORS + Exception Handler │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│         API Router (v1/__init__.py)      │
│   /auth  /rides  /wallet  /admin  /ws   │
└──────────────────┬───────────────────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│  core/ (Security │  │  db/ (Session, Base, │
│  Config, Deps,   │  │  Seed, Alembic)      │
│  Exceptions)     │  └──────────────────────┘
└──────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│           models/ (SQLAlchemy ORM)       │
│  User, Ride, Wallet, Payment, Rating...  │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│          schemas/ (Pydantic v2)          │
│  Request validation + Response shaping  │
└──────────────────────────────────────────┘
```

---

## 2. 📂 Full Folder Structure Explained

```
backend/
├── app/
│   ├── main.py              ← App entry, CORS, global exception handlers
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py  ← Combines all routers into one api_router
│   │       ├── auth.py      ← Register, Login, Refresh, Logout
│   │       ├── users.py     ← GET/PATCH /users/me (profile)
│   │       ├── drivers.py   ← Driver profile CRUD, online toggle
│   │       ├── rides.py     ← Booking, dispatch, status, history, rating
│   │       ├── payments.py  ← Ride payment processing + wallet debit
│   │       ├── wallet.py    ← Balance, add money, transaction ledger
│   │       ├── notifications.py ← In-app alerts fetch + mark read
│   │       ├── admin.py     ← Analytics, user/driver/ride management
│   │       └── tracking.py  ← WebSocket real-time GPS room manager
│   ├── core/
│   │   ├── config.py        ← Pydantic BaseSettings (reads .env)
│   │   ├── security.py      ← bcrypt + JWT create/verify
│   │   ├── deps.py          ← FastAPI Depends: DB session, auth, RBAC
│   │   ├── exceptions.py    ← Custom exception classes
│   │   └── logging.py       ← Structured logging setup
│   ├── db/
│   │   ├── base.py          ← SQLAlchemy engine + declarative Base
│   │   ├── session.py       ← Async session factory + get_db generator
│   │   └── seed.py          ← Demo data for local development
│   ├── models/              ← SQLAlchemy ORM table definitions
│   └── schemas/             ← Pydantic v2 request/response schemas
├── alembic/                 ← Database migration scripts
└── requirements.txt
```

---

## 3. 🚀 Entry Point — `main.py`

**File:** [`app/main.py`](file:///c:/NagendraOlaBackend/zippr/backend/app/main.py)

This is the **first file Python loads**. It creates the FastAPI application instance and wires everything together.

### What it does step by step:

#### 3.1 Lifespan Context Manager
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()          # Configure structured logging
    logging.info("Starting") # Log startup
    yield                    # App runs here
    await engine.dispose()   # Clean up DB connections on shutdown
```
> `lifespan` replaces deprecated `@app.on_event("startup")`. It runs **before** the first request and **after** the last one.

#### 3.2 CORS Middleware
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
> CORS allows the React frontend (on port 5173) to call this backend (port 8000) from a different origin. Without this, browsers block cross-origin requests.

#### 3.3 Global Exception Handlers
Two handlers are registered:
- **`ZipprException`** — Our custom business errors (401, 403, 404). Returns `{"detail": "...", "code": "..."}`.
- **`Exception`** — Catches anything unexpected. Returns a clean 500 error instead of an ugly Python stack trace.

#### 3.4 Health Check
```
GET /health → {"status": "healthy", "service": "zippr-backend"}
```
> Used for Docker healthchecks, load balancers, and uptime monitoring.

---

## 4. ⚙️ Core Layer — `app/core/`

### 4.1 `config.py` — Environment Configuration

**Pattern:** Pydantic `BaseSettings` reads `.env` automatically.

```python
class Settings(BaseSettings):
    SECRET_KEY: str           # Used to sign JWTs
    DATABASE_URL: str         # PostgreSQL connection string
    CORS_ORIGINS: List[str]   # Allowed frontend origins
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
```

> **Key rule:** Never hardcode secrets. Everything comes from the `.env` file. The `settings` singleton is imported across the entire app.

---

### 4.2 `security.py` — Passwords & JWT Tokens

This module handles **two concerns**: password hashing and JWT lifecycle.

#### Password Hashing (bcrypt)
```python
pwd_context = CryptContext(schemes=["bcrypt"])

hash_password("mypassword")       # Returns "$2b$12$abc..."
verify_password("mypassword", hash) # Returns True/False
```
> Bcrypt is a **one-way** algorithm. The raw password is **never stored** — only the hash. Even if the database is leaked, passwords remain safe.

#### JWT Token Creation
```python
def create_access_token(user_id):
    payload = {
        "sub": user_id,   # Subject — who this token is for
        "exp": now + 30min, # Expiry time
        "type": "access"  # Distinguishes from refresh
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
```

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 30 minutes | Authenticate every API request |
| Refresh Token | 7 days | Get a new Access Token without re-login |

#### Token Verification
```python
def verify_token(token, token_type="access"):
    payload = jwt.decode(token, SECRET_KEY)
    if payload["type"] != token_type: return None
    return payload["sub"]  # Returns user_id
```

---

### 4.3 `deps.py` — FastAPI Dependencies (Reusable Logic)

This is the **dependency injection hub**. Every endpoint uses functions from here.

#### `get_db` — Database Session Provider
```python
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session  # Provide session to endpoint
        # Auto-closes after request completes
```
> Every endpoint that touches the database declares `db: AsyncSession = Depends(get_db)`. FastAPI automatically creates and closes sessions.

#### `get_current_user` — Authentication Guard
```python
async def get_current_user(token=Security(reusable_oauth2), db=Depends(get_db)):
    user_id = verify_token(token.credentials, "access")
    user = await db.get(User, user_id)
    if not user.is_active:
        raise ForbiddenException("Account inactive")
    return user
```
> Extracts the `Bearer <token>` from the `Authorization` header, verifies it, and loads the full User object from the database.

#### `RoleChecker` + `require_role` — RBAC Enforcement
```python
class RoleChecker:
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def __call__(self, user=Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise ForbiddenException("Insufficient permissions")
        return user

def require_role(roles):
    return RoleChecker(roles)  # Returns a callable dependency
```
**Usage in endpoints:**
```python
# Only users with role="user" can book rides
current_user = Depends(require_role(["user"]))

# Only admins can view analytics
admin = Depends(require_role(["admin"]))
```

---

### 4.4 `exceptions.py` — Custom Error Classes
```python
class ZipprException(Exception):
    def __init__(self, detail, code, status_code):
        self.detail = detail
        self.code = code
        self.status_code = status_code

class CredentialsException(ZipprException):
    # Raised when JWT is invalid/expired → 401

class ForbiddenException(ZipprException):
    # Raised when role doesn't match → 403
```
> Centralizing errors means every part of the app raises the same structured response. `main.py` catches these and formats them as `{"detail": "...", "code": "..."}`.

---

## 5. 🗄️ Database Layer — `app/db/`

### 5.1 `base.py` — Engine & Declarative Base

```python
engine = create_async_engine(settings.DATABASE_URL, echo=False)
Base = declarative_base()
```
- **`engine`** — The async PostgreSQL connection pool (uses `asyncpg` driver).
- **`Base`** — All SQLAlchemy models inherit from this. It's how Alembic discovers tables to migrate.

### 5.2 `session.py` — Session Factory

```python
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
```
> `expire_on_commit=False` means model attributes are still accessible after a `commit()` without hitting the database again.

### 5.3 Alembic — Database Migrations

Alembic tracks every schema change as a versioned script.

```
alembic/versions/0001_initial.py  ← Creates ALL tables on first run
```

**Commands:**
```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration after changing a model
alembic revision --autogenerate -m "add column X to rides"

# Rollback one migration
alembic downgrade -1
```

> **Never modify the database directly with raw SQL for schema changes.** Always use Alembic migrations so the team and production stay in sync.

---

## 6. 📋 Data Models — `app/models/`

Each file defines one (or more) SQLAlchemy ORM class(es) that map to a PostgreSQL table.

### 6.1 `user.py` — Users Table

```
users
├── id (UUID, PK)
├── name (String)
├── email (String, unique)
├── phone (String, unique)
├── password_hash (String)
├── role (Enum: user | driver | admin)
├── is_active (Boolean, default=True)
└── created_at (DateTime)
```

**Role Enum drives the entire RBAC system:**
- `user` → Rider (books rides, manages wallet)
- `driver` → Partner (accepts rides, drives)
- `admin` → Operator (manages everything)

---

### 6.2 `driver_profile.py` — Driver Profiles Table

```
driver_profiles
├── user_id (UUID, FK → users.id, PK)
├── vehicle_type (Enum: bike | auto | cab)
├── vehicle_number (String)
├── license_number (String)
├── is_online (Boolean)  ← Toggle from driver dashboard
├── current_lat (Float)  ← Updated via GPS
├── current_lng (Float)  ← Updated via GPS
├── rating (Float)       ← Aggregate average, auto-updated on new ratings
└── is_verified (Boolean) ← Admin manually verifies
```

> One-to-one with `users`. A driver has both a `users` row (for auth/login) and a `driver_profiles` row (for vehicle info).

---

### 6.3 `ride.py` — Rides Table + Status Events

```
rides
├── id (UUID, PK)
├── rider_id (FK → users.id)
├── driver_id (FK → users.id, nullable) ← Null until a driver accepts
├── pickup_lat, pickup_lng (Float)
├── drop_lat, drop_lng (Float)
├── vehicle_type (Enum: bike | auto | cab)
├── status (Enum) ← The ride lifecycle state machine
├── fare_estimate (Float) ← Server-calculated fare
├── fare_final (Float, nullable) ← Set on completion
├── distance_km (Float)
├── requested_at (DateTime)
├── started_at (DateTime, nullable)
└── completed_at (DateTime, nullable)
```

**Ride Status State Machine:**

```
requested → accepted → arrived → ongoing → completed
    └──────────────────────────────────→ cancelled
```

| Status | Who triggers | Meaning |
|--------|-------------|---------|
| `requested` | Rider (POST /rides) | In dispatch pool, waiting for driver |
| `accepted` | Driver (PATCH /rides/{id}/status) | Driver claimed this ride |
| `arrived` | Driver | Driver reached pickup point |
| `ongoing` | Driver | Trip has started |
| `completed` | Driver | Trip finished, fare finalized |
| `cancelled` | Rider or Driver | Ride abandoned |

**`ride_status_events` — Immutable Audit Trail:**
```
ride_status_events
├── ride_id (FK → rides.id)
├── status (Enum)
└── timestamp (DateTime)
```
> Every time `status` changes, a new row is written here. This creates an **audit log** showing exactly when each transition happened. Useful for dispute resolution.

---

### 6.4 `wallet.py` — Wallet + Transaction Ledger

```
wallets
├── user_id (UUID, FK → users.id, PK)
├── balance (Numeric)  ← Cached balance
└── currency (String, default="INR")

wallet_transactions
├── id (Integer, autoincrement PK)
├── wallet_id (FK → users.id)
├── type (Enum: credit | debit)
├── amount (Numeric)
├── reason (String)
├── ride_id (FK → rides.id, nullable)
└── created_at (DateTime)
```

> **Critical design:** The `balance` column is a **cached value** updated for speed. The `wallet_transactions` table is the **source of truth** — every credit and debit is immutable. This prevents fraud and enables full audit history.

---

### 6.5 `payment.py` — Payment Records

```
payments
├── id (UUID, PK)
├── ride_id (FK → rides.id)
├── amount (Numeric)
├── method (Enum: wallet | card | upi | cash)
├── status (Enum: pending | success | failed | refunded)
├── transaction_ref (String) ← Unique reference number
└── created_at (DateTime)
```

> Payments are separate from wallets. A wallet transaction records a **balance change**; a payment records the **ride settlement event**. A ride can be paid by cash (no wallet debit needed), but still creates a payment record.

---

### 6.6 `rating.py` — Ratings

```
ratings
├── ride_id (FK → rides.id, PK) ← One rating per ride
├── rated_by (FK → users.id)    ← The rider
├── rated_user (FK → users.id)  ← The driver
├── stars (Integer, 1-5)
└── comment (String, nullable)
```

> The `ride_id` as primary key enforces that **each ride can only be rated once**. After submission, `driver_profiles.rating` is recalculated using `AVG(stars)`.

---

### 6.7 `notification.py`

```
notifications
├── id (Integer, PK)
├── user_id (FK → users.id)
├── title (String)
├── body (String)
├── type (String: ride | promo | alert | info)
├── is_read (Boolean, default=False)
└── created_at (DateTime)
```

---

### 6.8 `blog.py` & `support.py`

| Table | Purpose |
|-------|---------|
| `blog_posts` | SEO-friendly blog content served to public pages |
| `support_tickets` | Customer support requests from users |

---

## 7. 📐 Schemas — `app/schemas/`

Pydantic v2 schemas serve two roles:
1. **Validate incoming request bodies** — FastAPI rejects malformed data automatically.
2. **Shape outgoing responses** — Only the declared fields are returned (no accidental data leaks).

### Key Schema Patterns

#### `auth.py`
```python
class LoginRequest(BaseModel):
    email: EmailStr    # Validates email format
    password: str

class TokenResponse(BaseModel):
    user: UserRead     # Nested serialization
    access_token: str
    refresh_token: str
```

#### `ride.py`
```python
class FareEstimateRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float

class RideCreate(FareEstimateRequest):
    vehicle_type: str
    fare_estimate: float  # Client sends estimate from /estimate endpoint
```

#### `common.py` — Generic Pagination
```python
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int
```
> Used by rides, admin endpoints, etc. A single generic class handles pagination for any resource.

---

## 8. 🔌 API Layer — Module-by-Module

### 8.1 `auth.py` — Authentication Flow

```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

**Registration Flow:**
```
1. Check if email/phone already exists → 400 if so
2. Generate UUID for user_id
3. Hash password with bcrypt
4. Create User row in DB
5. Create Wallet row (balance=0) for this user
6. Generate access_token + refresh_token
7. Return: { user, access_token, refresh_token }
```

**Login Flow:**
```
1. Find user by email
2. verify_password(input, stored_hash) → 401 if mismatch
3. Check is_active → 403 if banned
4. Issue new tokens
5. Return: { user, access_token, refresh_token }
```

**Refresh Flow (Token Rotation):**
```
1. Decode refresh_token → verify "type" == "refresh"
2. Extract user_id from "sub" claim
3. Verify user still exists and is active
4. Issue BOTH a new access_token AND a new refresh_token
5. The old refresh token is implicitly invalidated by client replacing it
```

---

### 8.2 `users.py` — Profile Management

```
GET  /api/v1/users/me    → Returns logged-in user's profile
PATCH /api/v1/users/me   → Updates name/phone (email protected)
```

> Both endpoints require a valid JWT. The `get_current_user` dependency automatically provides the `User` object.

---

### 8.3 `drivers.py` — Driver Profile

```
GET    /api/v1/drivers/me        → Driver's own profile
POST   /api/v1/drivers/me        → Create/update vehicle profile
PATCH  /api/v1/drivers/location  → Update GPS coordinates
PATCH  /api/v1/drivers/online    → Toggle online/offline status
```

> Only users with `role="driver"` can access these endpoints (enforced by `require_role(["driver"])`).

---

### 8.4 `rides.py` — The Core Business Module

This is the most complex API module. It handles the **entire ride lifecycle**.

```
POST   /api/v1/rides/estimate    → Calculate fare (no auth needed for quote)
POST   /api/v1/rides             → Book a new ride (user only)
GET    /api/v1/rides/available   → Dispatch queue (driver only)
GET    /api/v1/rides/{id}        → Get single ride details
PATCH  /api/v1/rides/{id}/status → Drive the state machine
GET    /api/v1/rides             → Ride history (paginated)
POST   /api/v1/rides/{id}/rate   → Submit rating (user only)
```

**Fare Calculation Logic (`POST /estimate`):**
```python
distance = sqrt((drop_lat - pickup_lat)² + (drop_lng - pickup_lng)²) × 111 km
duration = distance × 2.5 minutes

# Bike:  ₹20 base + ₹8/km  + ₹1.5/min
# Auto:  ₹35 base + ₹12/km + ₹2/min
# Cab:   ₹60 base + ₹18/km + ₹3/min
```

> The `111` multiplier converts degrees to kilometers (1 degree ≈ 111 km). This is a simplified Euclidean approximation — in production, replace with Haversine formula or Google Maps Distance Matrix API.

**Rating Logic (`POST /rides/{id}/rate`):**
```
1. Validate ride is "completed" and belongs to this user
2. Check no existing rating for this ride (PK uniqueness)
3. Insert Rating row
4. db.flush() → Stage the row without committing
5. Run AVG(stars) query including the new row
6. Update driver_profiles.rating with new average
7. db.commit() → Atomic commit of both changes
```

---

### 8.5 `wallet.py` — Ledger System

```
GET  /api/v1/wallet              → Get balance
POST /api/v1/wallet/add-money    → Credit wallet
GET  /api/v1/wallet/transactions → Full transaction history
```

**Add Money Flow:**
```
1. Validate amount > 0
2. Fetch user's wallet (create if missing)
3. wallet.balance += amount  (update cached balance)
4. Write WalletTransaction(type="credit")  (immutable ledger)
5. Commit both atomically
```

---

### 8.6 `payments.py` — Ride Settlement

```
POST /api/v1/payments/process?ride_id=...&method=wallet
```

**Wallet Payment Flow:**
```
1. Verify ride belongs to current user
2. amount = ride.fare_estimate
3. Fetch rider's wallet
4. Check wallet.balance >= amount (else: "Insufficient funds")
5. wallet.balance -= amount
6. Write WalletTransaction(type="debit", ride_id=...)
7. Write Payment(method="wallet", status="success")
8. Mark ride.status = "completed"
9. Commit all atomically in one transaction
```

> Cash payments skip steps 4-6 but still create the Payment record.

---

### 8.7 `notifications.py`

```
GET   /api/v1/notifications        → All notifications for current user
PATCH /api/v1/notifications/read   → Mark all as read
```

---

### 8.8 `admin.py` — God Mode APIs

All endpoints here require `role="admin"`.

```
GET /api/v1/admin/analytics/summary → KPI dashboard
GET /api/v1/admin/users             → All users (paginated)
GET /api/v1/admin/drivers           → All driver profiles
GET /api/v1/admin/rides             → All rides (paginated)
```

**Analytics Query (SQL aggregations):**
```python
total_riders  = COUNT(users WHERE role="user")
total_drivers = COUNT(users WHERE role="driver")
active_rides  = COUNT(rides WHERE status IN ["requested","accepted","ongoing"])
total_earnings = SUM(payments.amount WHERE status="success")
```

---

### 8.9 `tracking.py` — Real-Time WebSocket GPS

```
WS /api/v1/tracking/ws/{ride_id}
```

**Architecture — Room-based ConnectionManager:**
```python
class ConnectionManager:
    active_connections: Dict[str, List[WebSocket]]
    # { "ride-uuid-123": [ws_driver, ws_rider] }
```

**How it works:**
```
1. Both Driver and Rider connect to /ws/{same_ride_id}
2. Driver sends:  {"lat": 12.9716, "lng": 77.5946}
3. Server broadcasts this to all OTHER connections in the room
4. Rider receives the GPS update in real-time
5. On disconnect, WebSocket is removed from the room
```

> The server acts as a **relay/pub-sub broker**. It doesn't store GPS data — it only forwards messages. This keeps it stateless and fast.

---

## 9. 🔄 Complete Request Lifecycle (Walk-Through)

Let's trace a full "Book a Ride" flow end to end:

```
STEP 1: Rider → POST /auth/login
        ← { access_token: "eyJ...", user: {...} }

STEP 2: Rider → POST /rides/estimate
        Headers: Authorization: Bearer <access_token>
        Body: { pickup_lat, pickup_lng, drop_lat, drop_lng }
        FastAPI calls get_current_user dep → verifies token → loads User
        Fare math runs server-side
        ← [{ vehicle_type: "bike", fare_estimate: 87.5 }, ...]

STEP 3: Rider → POST /rides
        Body: { ...coords, vehicle_type: "bike", fare_estimate: 87.5 }
        require_role(["user"]) dep checks role
        New Ride created with status="requested"
        RideStatusEvent written (audit)
        ← { id: "ride-uuid", status: "requested", ... }

STEP 4: Driver (separate session) → GET /rides/available
        Role check: must be "driver"
        Returns all rides WHERE status="requested" AND driver_id=NULL
        ← { items: [{ id: "ride-uuid", ... }] }

STEP 5: Driver → PATCH /rides/{id}/status
        Body: { status: "accepted" }
        Sets ride.driver_id = driver.id
        Writes RideStatusEvent(status="accepted")
        ← { status: "accepted", driver_id: "driver-uuid" }

STEP 6: Both → WS /tracking/ws/{ride_id}
        Driver sends GPS updates every 3 seconds
        Rider receives them in real-time → map marker moves

STEP 7: Driver → PATCH /rides/{id}/status { status: "ongoing" }
        Sets ride.started_at = now()

STEP 8: Driver → PATCH /rides/{id}/status { status: "completed" }
        Sets ride.completed_at = now()
        Sets ride.fare_final = ride.fare_estimate

STEP 9: Rider → POST /payments/process?ride_id=...&method=wallet
        Deducts balance from wallet
        Creates Payment record

STEP 10: Rider → POST /rides/{id}/rate
         Body: { stars: 5, comment: "Great ride!" }
         Inserts Rating row
         Recalculates driver's average rating
```

---

## 10. 🔐 Security Model Summary

| Concern | Implementation |
|---------|---------------|
| Password storage | bcrypt hash (never plaintext) |
| API authentication | JWT Bearer token in `Authorization` header |
| Token expiry | Access: 30 min, Refresh: 7 days |
| Token rotation | New refresh token issued on every `/refresh` call |
| Authorization | Role-based via `require_role()` FastAPI dependency |
| Input validation | Pydantic v2 schemas on every endpoint |
| SQL injection | SQLAlchemy ORM — no raw string interpolation |
| CORS | Explicit allow-list in `.env` |
| Error messages | Custom exceptions return structured JSON (no stack traces) |

---

## 11. 📊 Database Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ RIDES : "books (as rider)"
    USERS ||--o{ RIDES : "drives (as driver)"
    USERS ||--|| WALLETS : "owns"
    USERS ||--|| DRIVER_PROFILES : "has (if driver)"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ SUPPORT_TICKETS : "raises"

    RIDES ||--o{ RIDE_STATUS_EVENTS : "logs"
    RIDES ||--o| PAYMENTS : "settled via"
    RIDES ||--o| RATINGS : "reviewed in"

    WALLETS ||--o{ WALLET_TRANSACTIONS : "ledger"
    WALLET_TRANSACTIONS }o--o| RIDES : "linked to"
```

---

## 12. 🛠️ Local Development Quick Reference

### Start Backend
```bash
cd zippr/backend
# Activate virtual env (if using one)
venv\Scripts\activate     # Windows
source venv/bin/activate  # Mac/Linux

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.db.seed

# Start server
uvicorn app.main:app --reload
```

### API Docs (Auto-generated by FastAPI)
```
http://localhost:8000/docs    → Swagger UI (interactive)
http://localhost:8000/redoc   → ReDoc (read-only)
```

### Key Environment Variables (`.env`)
```
SECRET_KEY=<strong-random-string>
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/zipprdb
CORS_ORIGINS=["http://localhost:5173"]
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## 13. 📌 Common Patterns to Know

### Pattern 1: Every Protected Endpoint
```python
@router.get("/something")
async def my_endpoint(
    current_user: User = Depends(get_current_user),  # ← Auth
    db: AsyncSession = Depends(get_db)               # ← DB session
):
    ...
```

### Pattern 2: Role-Restricted Endpoint
```python
@router.post("/admin-only")
async def admin_action(
    admin: User = Depends(require_role(["admin"])),  # ← Auth + Role
    db: AsyncSession = Depends(get_db)
):
    ...
```

### Pattern 3: Atomic DB Operation
```python
db.add(object1)     # Stage object 1
db.add(object2)     # Stage object 2
await db.commit()   # Write BOTH atomically (or neither on failure)
await db.refresh(object1)  # Reload from DB (gets server-set fields)
```

### Pattern 4: Paginated Response
```python
query = select(Ride).where(...)
total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
items = (await db.execute(query.offset(offset).limit(limit))).scalars().all()
return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)
```
