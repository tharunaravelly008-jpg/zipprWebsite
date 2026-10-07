from typing import List
from fastapi import Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.exceptions import CredentialsException, ForbiddenException
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User

reusable_oauth2 = HTTPBearer(auto_error=False)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: HTTPAuthorizationCredentials = Security(reusable_oauth2)
) -> User:
    """Dependency to retrieve the currently logged-in user from the JWT bearer token."""
    if not token:
        raise CredentialsException("Authorization header required")
        
    user_id = verify_token(token.credentials, "access")
    if not user_id:
        raise CredentialsException("Token expired or invalid")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise CredentialsException("User account not found")
    if not user.is_active:
        raise ForbiddenException("User account is inactive")
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise ForbiddenException(f"Role '{current_user.role}' does not have permission to access this resource")
        return current_user

def require_role(roles: List[str]):
    """Returns a dependency validator enforcing specific roles."""
    return RoleChecker(roles)
