from pydantic import BaseModel
from typing import Optional

class CreateTopicDto(BaseModel):
    promptName: str
    #topicList: str
    public: Optional[bool] = False
    userId: str