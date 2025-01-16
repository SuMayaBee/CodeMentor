from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.mentorlog import CreateMentorLogDto
from typing import List
from swarm import Swarm, Agent
from dotenv import load_dotenv

# Load environment variables and initialize Swarm
load_dotenv()
client = Swarm()

# AI Agents
code_explanation_agent = Agent(
    instructions="You will be given a code. Explain the code line by line. Also in the beginning, tell the user what the code does in a short description. give them an easier version of code if needed."
)

text_explanation_agent = Agent(
    instructions="You will be given a text. User will ask you question what the user didn't understand from that text. Make them understand it by giving metaphors or real life examples."
)

title_agent = Agent(
    instructions="Create a suitable title for the context and question within 6/7 words. Print only the title and nothing else."
)

def explain_code():
    return code_explanation_agent

def explain_text():
    return text_explanation_agent

teacher_agent = Agent(
    functions=[explain_code, explain_text],
    instructions="You are a great teacher. Help user to understand code or text."
)

router = APIRouter(prefix="/mentor", tags=["mentor"])

@router.post("/create")
async def create_mentor_log(mentor_log: CreateMentorLogDto):
    """Create a new mentor log with AI-generated content"""
    db = Prisma()
    await db.connect()
    
    try:
        # Verify content exists
        content = await db.content.find_unique(
            where={
                "id": mentor_log.contentId
            }
        )
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
            
        # Generate title using AI
        title_response = client.run(
            agent=title_agent,
            messages=[{"role": "user", "content": f"context: {mentor_log.context}. The question is {mentor_log.question}. "}],
        )
        
        # Generate response using AI
        response_msg = client.run(
            agent=teacher_agent,
            messages=[{"role": "user", "content": f"context: {mentor_log.context}. The question is {mentor_log.question}. "}],
        )

        # Create mentor log in database
        new_log = await db.mentorlog.create(
            data={
                "title": title_response.messages[-1]["content"],
                "context": mentor_log.context,
                "question": mentor_log.question,
                "response": response_msg.messages[-1]["content"],
                "userId": mentor_log.userId,
                "contentId": mentor_log.contentId,
            },
            include={
                "user": True,
                "content": True
            }
        )
        return new_log
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await db.disconnect()


@router.get("/content/{content_id}")
async def get_content_mentor_logs(content_id: str):
    """Get all mentor logs for a specific content"""
    db = Prisma()
    await db.connect()
    
    try:
        logs = await db.mentorlog.find_many(
            where={
                "contentId": content_id
            },
            include={
                "user": True,
                "content": True
            }
        )
        return logs
    finally:
        await db.disconnect()

@router.get("/{mentor_log_id}")
async def get_mentor_log_by_id(mentor_log_id: str):
    """Get a specific mentor log by ID"""
    db = Prisma()
    await db.connect()
    
    try:
        log = await db.mentorlog.find_unique(
            where={
                "id": mentor_log_id
            },
            include={
                "user": True,
                "content": True
            }
        )
        if not log:
            raise HTTPException(status_code=404, detail="MentorLog not found")
        return log
    finally:
        await db.disconnect()