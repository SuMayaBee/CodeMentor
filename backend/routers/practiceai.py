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
  


class QueryResponse(BaseModel):
    response: str


load_dotenv()
client = Swarm()

problem_creation_agent = Agent(
    instructions="Based on what the user wants to practice, generate a problem. Set the problem difficulty based on the user."
)

problem_modifying_agent = Agent(
    instructions="You will be given a problem that the problem might find too hard or too easy. Give a harder or easier problem based on what the user wants."
)


problem_solve_helper = Agent(
    instructions="You will be given the current progress of the user. "
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
async def create_a_problem(request: QueryRequestModify):
    response = client.run(
            agent=problem_modifying_agent,
            messages=[{"role": "user", "content": f"user specification: {request.user_specification}. Topic and language: {request.topic} {request.language}. Difficulty: {request.difficulty}. But user wants {request.user_wants} problem"}],
        )

    return response.messages[-1]["content"]
