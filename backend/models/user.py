from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CreateUserDto(BaseModel):
    clerkUserId: str
    email: str
    name: Optional[str] = None
    imageUrl: Optional[str] = None
    credit: Optional[float] = 0