from pydantic import BaseModel
from typing import Optional

class CreateMentorLogDto(BaseModel):
    title: Optional[str] = None
    context: str
    question: str
    response: Optional[str] = None
    userId: str
    contentId: str