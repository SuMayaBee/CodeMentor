from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.content import CreateContentDto
from typing import List
from swarm import Swarm, Agent
from dotenv import load_dotenv

from pydantic import BaseModel


from langchain_core.messages import AIMessage, HumanMessage 
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import Chroma


################################ FROM WEB ##########################################################################

chat_history = [AIMessage(content="Hello, I'm a bot. How can I help you today?"), HumanMessage(content="You will be making a summary content or ellaborated content based on a topic from the website.")]
vector_store_cache = {}

class QueryRequest(BaseModel):
    website_url: str
    question: str
    topic: str 

class QueryResponse(BaseModel):
    response: str


def get_vectorstore_from_url(url):

    loader = WebBaseLoader(url)
    document = loader.load()
    text_spliter = RecursiveCharacterTextSplitter()
    document_chunks = text_spliter.split_documents(document)
    vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())

    return vectorstore


def get_context_retriever_chain(vectorstore):

    llm = ChatOpenAI()
    retriever = vectorstore.as_retriever()
    prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation")
    ])
    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

    return retriever_chain


def get_conversational_rag_chain(retriever_chain):   

    llm = ChatOpenAI()  
    prompt = ChatPromptTemplate.from_messages([
      ("system", "Answer the user's questions based on the below context:\n\n{context}"),
      MessagesPlaceholder(variable_name="chat_history"),
      ("user", "{input}"),
    ])  
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    
    return create_retrieval_chain(retriever_chain, stuff_documents_chain)


def get_response(user_query, vector_store):

    retriever_chain = get_context_retriever_chain(vector_store)
    conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
    response = conversation_rag_chain.invoke({
            "chat_history": chat_history,
            "input": user_query
        })
    
    return response["answer"]



##########################################################################################################################
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

content_based_on_website = Agent(
    instructions="You will make a summary type note from each of the topic of the website that " 
)

router = APIRouter(prefix="/content", tags=["content"])



@router.post("/create_from_web")
async def chat_with_website(query: QueryRequest):
    website_url = query.website_url
    question = query.question
    topic = query.topic 

    q = f"You are my mentor. Now the topic i want to learn is {topic}. My question or query is {question}"

    # Validate input
    if not website_url or not question:
        raise HTTPException(status_code=400, detail="Both 'website_url' and 'question' are required.")

    # Load or retrieve vector store
    if website_url not in vector_store_cache:
        try:
            vector_store_cache[website_url] = get_vectorstore_from_url(website_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process website URL: {str(e)}")

    vector_store = vector_store_cache[website_url]

    # Get response from the vector store and model
    try:
        response = get_response(q, vector_store=vector_store)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    return QueryResponse(response=response)


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