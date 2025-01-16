from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.content import CreateContentDto
from typing import List
from swarm import Swarm, Agent
from dotenv import load_dotenv

# Load environment variables and initialize Swarm
load_dotenv()
client = Swarm()

# AI Agents
content_theory_agent = Agent(
    instructions="You will explain the topic given to you considering the user's age and experience. Don't say welcome or hi. Just start with explaining with metaphors or real world examples. Don't show any code of that topic. Try to make him understand the concept of the topic. Also consider the preference of the user when generating the documentation."
)

content_code_agent = Agent(
    instructions="You will generate 5 coding examples on the topic you are given for the user to learn considering the user's preference.Don't say welcome or hi or things like 'That's a great choice'. Just start with the code."
)

content_syntax_agent = Agent(
    instructions="You will explain the user the syntax of a given topic considering the user's preference. If the topic doesn't have any coding concept then just return NULL. Don't say welcome or hi or things like 'That's a great choice'."
)

router = APIRouter(prefix="/content", tags=["content"])

@router.post("/create")
async def create_content(content: CreateContentDto):
    db = Prisma()
    await db.connect()
    
    try:
        # Generate content using AI agents
        theory_response = client.run(
            agent=content_theory_agent,
            messages=[{"role": "user", "content": content.prompt}]
        )
        
        code_response = client.run(
            agent=content_code_agent,
            messages=[{"role": "user", "content": content.prompt}]
        )
        
        syntax_response = client.run(
            agent=content_syntax_agent,
            messages=[{"role": "user", "content": content.prompt}]
        )

        # Create content in database
        new_content = await db.content.create(
            data={
                "title": content.title,
                "prompt": content.prompt,
                "contentTheory": theory_response.messages[-1]["content"],
                "contentCodes": code_response.messages[-1]["content"],
                "contentSyntax": syntax_response.messages[-1]["content"],
                "public": content.public,
                "userId": content.userId,
            }
        )
        return new_content
    finally:
        await db.disconnect()

@router.get("/public")
async def get_public_content():
    db = Prisma()
    await db.connect()
    try:
        return await db.content.find_many(
            where={"public": True},
            include={"user": True}
        )
    finally:
        await db.disconnect()

@router.get("/public/titles", response_model=List[str])
async def get_public_titles():
    db = Prisma()
    await db.connect()
    try:
        contents = await db.content.find_many(
            where={"public": True}
        )
        return [content.title for content in contents]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await db.disconnect()

@router.get("/{content_id}")
async def get_content_by_id(content_id: str):
    db = Prisma()
    await db.connect()
    try:
        content = await db.content.find_unique(
            where={"id": content_id},
            include={"user": True, "mentorLogs": True}
        )
        if not content:
            raise HTTPException(status_code=404, detail="Content not found")
        return content
    finally:
        await db.disconnect()

@router.get("/user/{user_id}")
async def get_user_content(user_id: str):
    db = Prisma()
    await db.connect()
    try:
        return await db.content.find_many(
            where={"userId": user_id},
            include={"mentorLogs": True}
        )
    finally:
        await db.disconnect()