from fastapi import APIRouter, HTTPException
from prisma import Prisma

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/create")
async def create_user(user: dict):
    """
    Insert a new user record.
    """
    db = Prisma()
    await db.connect()
    
    try:
        new_user = await db.user.create(
            data={
                "clerkUserId": user["clerkUserId"],
                "email": user["email"],
                "name": user.get("name"),
                "imageUrl": user.get("imageUrl"),
                "credit": user.get("credit", 0)
            },
            include={
                "topics": True,
                "contents": True
            }
        )
        return new_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        await db.disconnect()

@router.get("/{user_id}")
async def get_user(user_id: str):
    """
    Get a user by their clerk ID along with their topics and contents.
    """
    db = Prisma()
    await db.connect()
    
    try:
        user = await db.user.find_unique(
            where={
                "id": user_id
            },
            include={
                "topics": True,
                "contents": True,
                "mentorLogs": True
            }
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {
            "user": user,
            "topics": user.topics,
            "contents": user.contents
        }
    finally:
        await db.disconnect()