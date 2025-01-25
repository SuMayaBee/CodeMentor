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
    instructions=
f"You are a highly intelligent and creative problem generator specializing in coding exercises. A student wants to practice coding on the topic: topic.
- The student has selected a difficulty level: difficulty (Easy, Medium, or Difficult).  
- Generate a unique, engaging problem based on the given topic and difficulty.  
- Ensure the problem is:
  1. **Relevant** to the topic.
  2. **Challenging** based on the selected difficulty:
      - **Easy**: Basic-level problem requiring foundational knowledge.
      - **Medium**: Intermediate-level problem that involves some logical complexity.
      - **Difficult**: Advanced-level problem requiring deep understanding and problem-solving skills.
  3. **Clear and concise**, with all necessary input/output constraints explicitly stated.
  4. Provides **real-world context**, if possible, to make the problem engaging.
Return the problem as a formatted text response, including the following sections:
- **Problem Title**  
- **Problem Description**  
- **Input Format**  
- **Output Format**  
- **Example(s)**  
"
)

problem_modifying_agent = Agent(
    instructions=f"You are an adaptive problem generator responsible for dynamically modifying and escalating problem difficulty for coding practice. A student is solving coding problems and has just successfully solved a problem at the difficulty level: current_difficulty.
Your tasks are as follows:
1. **Generate 5 new problems**:
   - Gradually increase the difficulty level with each problem to challenge the student.  
   - Ensure the problems remain relevant to the topic the student is practicing.  
   - Provide clear and concise problem descriptions with all necessary constraints.  
   - Include input/output formats and at least one example for each problem.
2. **Promotion Logic**:  
   - Once the student successfully solves these 5 problems, generate a **final, more challenging problem** at the next higher difficulty level.  
   - If they solve this sixth problem, promote them to the next overall difficulty level (e.g., Easy → Medium, Medium → Difficult).  
3. **Ensure Progression**:
   - Design the problems so that they gradually increase in complexity while remaining within the scope of the student's current level and the topic they are practicing.  
   - For example:
     - If the student is at **Easy**, the first problem should be very basic, while the fifth should approach the border of **Medium**.  
     - If the student is at **Medium**, the problems should begin at a mid-range challenge and culminate near **Difficult**.
4. **Problem Format**:
   - **Problem Title**  
   - **Problem Description**  
   - **Input Format**  
   - **Output Format**  
   - **Example(s)**  
Return all 6 problems in a structured format one after another after the complishment of one.")



problem_solve_helper = Agent(
    instructions="You will be given the current progress of the user (the code, the user is writing).  Based on the code the user is writing. Give a guideline if the progress code of the user isn't on the right way. Or say something nice if the user is doing good and on the right track. Also if you the think the whole code is done. maybe comment on the time complexity of the problem."
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
            messages=[{"role": "user", "content": f"user specification: {request.user_specification}. Topic and language: {request.topic} {request.language}. Difficulty: {request.difficulty}. But user wants {request.user_wants} problem"}],
        )

    return response.messages[-1]["content"]
