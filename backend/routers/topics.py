from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.topic import CreateTopicDto
from typing import List
from swarm import Swarm, Agent
from dotenv import load_dotenv

load_dotenv()
client = Swarm()


topic_agent_advanced = Agent(
    instructions=f"You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. The user want to learn everything in depth and advanced. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 8 and 9."
)

topic_agent_beginner = Agent(
    instructions=f"You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. The user is a beginner. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 15 and 20."
)

def generate_advanced_topics():
    return topic_agent_advanced 

def generate_beginner_topics():
    return topic_agent_beginner

topic_agent = Agent(
    functions=[generate_advanced_topics, generate_beginner_topics],
    instructions="You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. Consider his age and prior experience in coding. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 8 and 9."
)

router = APIRouter(prefix="/topics", tags=["topics"])

@router.post("/create")
async def create_topic(topic: CreateTopicDto):
    db = Prisma()
    await db.connect()
    
    try:
        response = client.run(
            agent=topic_agent,
            messages=[{"role": "user", "content": f"{topic.promptName}"}],
        )
        
        new_topic = await db.topic.create(
            data={
                "promptName": topic.promptName,
                "topicList": response.messages[-1]["content"],
                "public": topic.public,
                "userId": topic.userId,
            }
        )
        return new_topic
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await db.disconnect()

@router.get("/public")
async def get_public_topics():
    """Get all public topics"""
    db = Prisma()
    await db.connect()
    
    try:
        topics = await db.topic.find_many(
            where={
                "public": True
            },
            include={
                "user": True
            }
        )
        return topics
    finally:
        await db.disconnect()

@router.get("/{topic_id}")
async def get_topic(topic_id: str):
    """Get a topic by ID"""
    db = Prisma()
    await db.connect()
    
    try:
        topic = await db.topic.find_unique(
            where={
                "id": topic_id
            },
            include={
                "user": True
            }
        )
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        return topic
    finally:
        await db.disconnect()

@router.get("/user/{user_id}")
async def get_user_topics(user_id: str):
    """Get all topics for a user"""
    db = Prisma()
    await db.connect()
    
    try:
        topics = await db.topic.find_many(
            where={
                "userId": user_id
            },
            include={
                "user": True
            }
        )
        return topics
    finally:
        await db.disconnect()