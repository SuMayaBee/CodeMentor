from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.users import router as user_router
from routers.contents import router as content_router
from routers.topics import router as topic_router
from routers.mentorlogs import router as mentor_log_router
from routers.quiz import router as quiz_router 

app = FastAPI(
    title="CodeMentor API",
    description="Backend API for CodeMentor application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
app.include_router(content_router)
app.include_router(topic_router)
app.include_router(mentor_log_router)
app.include_router(quiz_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




# uvicorn main:app --host 0.0.0.0 --port 8000 --reload