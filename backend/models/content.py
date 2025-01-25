from pydantic import BaseModel
from typing import Optional

class CreateContentDto(BaseModel):
    title: str
    prompt: str
    contentTheory: Optional[str] = None
    contentCodes: Optional[str] = None
    contentSyntax: Optional[str] = None
    public: Optional[bool] = False
    userId: str