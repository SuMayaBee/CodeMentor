from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
# from langchain_openai import ChatOpenAI
# from langchain_chroma import Chroma
# from langchain_openai import OpenAIEmbeddings
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
# from langchain.chains import create_history_aware_retriever, create_retrieval_chain
# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.messages import AIMessage, HumanMessage
# import os
from swarm import Swarm, Agent
from dotenv import load_dotenv

from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/practice", tags=["practice"])


class QueryRequest(BaseModel):
    user_specification: str
    topic: str
    difficulty: str 
    language: str 
  
  
class QueryRequestModify(BaseModel):
    user_specification: str
    topic: str
    difficulty: str 
    language: str 
    given_problem: str 
    user_wants: str # easier/harder 
  

class LiveRequest(BaseModel):
    given_problem: str 
    topic: str 
    language: str 
    user_code: str 

class QueryResponse(BaseModel):
    response: str


load_dotenv()
client = Swarm()

problem_creation_agent = Agent(
    instructions=(
        "You are a highly intelligent and creative problem generator specializing in coding exercises. "
        "A student wants to practice coding on the topic: topic.\n"
        "- The student has selected a difficulty level: difficulty (Easy, Medium, or Difficult).\n"
        "- Generate a unique, engaging problem based on the given topic and difficulty.\n"
        "- Ensure the problem is:\n"
        "  1. **Relevant** to the topic.\n"
        "  2. **Challenging** based on the selected difficulty:\n"
        "      - **Easy**: Basic-level problem requiring foundational knowledge.\n"
        "      - **Medium**: Intermediate-level problem that involves some logical complexity.\n"
        "      - **Difficult**: Advanced-level problem requiring deep understanding and problem-solving skills.\n"
        "  3. **Clear and concise**, with all necessary input/output constraints explicitly stated.\n"
        "  4. Provides **real-world context**, if possible, to make the problem engaging.\n"
        "Return the problem as a formatted text response, including the following sections:\n"
        "- **Problem Title**\n"
        "- **Problem Description**\n"
        "- **Input Format**\n"
        "- **Output Format**\n"
        "- **Example(s)**\n"
    )
)

problem_modifying_agent = Agent(
    instructions=(
        "You are an adaptive problem generator responsible for dynamically modifying and escalating problem difficulty for coding practice. "
        "A student is solving coding problems and has just successfully solved a problem at the difficulty level: that problem is done.\n"
        "Your tasks are as follows:\n"
        "4. **Problem Format**:\n"
        "   - **Problem Title**\n"
        "   - **Problem Description**\n"
        "   - **Input Format**\n"
        "   - **Output Format**\n"
        "   - **Example(s)**\n"
     
    )
)



problem_solve_helper = Agent(
    instructions="Your message would be 2 or 3 sentence max. You will be given the current progress of the user (the code, the user is writing).  Based on the code the user is writing. Give a guideline if the progress code of the user isn't on the right way. Or say something nice if the user is doing good and on the right track. Also if you the think the whole code is done. maybe comment on the time complexity of the problem."
)


@router.post("/create")
async def create_a_problem(request: QueryRequest):
    response = client.run(
            agent=problem_creation_agent,
            messages=[{"role": "user", "content": f"user specification: {request.user_specification}. Topic and language: {request.topic} {request.language}. Difficulty: {request.difficulty}"}],
        )

    return response.messages[-1]["content"]


@router.post("/modify")
async def create_a_problem(request: QueryRequestModify):
    response = client.run(
            agent=problem_modifying_agent,
            messages=[{"role": "user", "content": f"user specification: {request.user_specification}. Topic and language: {request.topic} {request.language}. Difficulty: {request.difficulty}. But user wants {request.user_wants} problem"}],
        )

    return response.messages[-1]["content"]


@router.post("/live_tracking")
async def create_a_problem(request: LiveRequest):
    response = client.run(
            agent=problem_solve_helper,
            messages=[{"role": "user", "content": f"Topic and language: {request.topic} {request.language}.  Given Problem {request.given_problem} user current progress {request.user_code}."}],
        )

    return response.messages[-1]["content"]