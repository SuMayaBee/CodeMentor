from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from swarm import Swarm, Agent
from dotenv import load_dotenv
from prisma import Prisma
import uvicorn

load_dotenv()
app = FastAPI()
client = Swarm()

# ...existing agent definitions...

class MessageRequest(BaseModel):
    user_age: int
    language: str 
    preference: str
    userId: str  # Added for Prisma integration
 
class ContentRequest(BaseModel):
    user_age: int 
    language: str 
    preference: str 
    topic_name: str
    userId: str  # Added for Prisma integration

class TeacherRequest(BaseModel):
    user_age: int
    context: str 
    question: str 
    language: str 
    topic_name: str
    userId: str      # Added for Prisma integration
    contentId: str   # Added for Prisma integration

@app.post("/topic_generation")
async def topic_generation(request: MessageRequest):
    db = Prisma()
    await db.connect()
    
    try:
        response = client.run(
            agent=topic_agent,
            messages=[{"role": "user", "content": f"I want to learn {request.language}. {request.preference}. I am {request.user_age} years old."}],
        )
        
        # Save to database
        topic = await db.topic.create(
            data={
                "promptName": request.language,
                "topicList": response.messages[-1]["content"],
                "public": False,
                "userId": request.userId
            }
        )
        
        return {"response": response.messages[-1]["content"], "topicId": topic.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        await db.disconnect()

@app.post("/content_theory_generation")
async def content_theory_generation(request: ContentRequest):
    db = Prisma()
    await db.connect()
    
    try:
        response = client.run(
            agent=content_theory_agent,
            messages=[{"role": "user", "content": f"I want to learn {request.language}. {request.preference}. I am {request.user_age} years old. The topic I want to learn of this language is {request.topic_name}"}],
        )
        
        return {"response": response.messages[-1]["content"]}
    finally:
        await db.disconnect()

@app.post("/code_mentor")
async def code_mentor(request: TeacherRequest):
    db = Prisma()
    await db.connect()
    
    try:
        response = client.run(
            agent=teacher_agent,
            messages=[{"role": "user", "content": f"I am {request.user_age} years old. I was learning {request.topic_name} of {request.language}. A part said: {request.context}. Now my question or confusion is, {request.question}"}],
        )
        
        # Save mentor log
        mentor_log = await db.mentorlog.create(
            data={
                "context": request.context,
                "question": request.question,
                "response": response.messages[-1]["content"],
                "userId": request.userId,
                "contentId": request.contentId
            }
        )
        
        return {"response": response.messages[-1]["content"], "logId": mentor_log.id}
    finally:
        await db.disconnect()

# ...existing content generation endpoints...

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)