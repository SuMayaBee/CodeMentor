from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.topic import CreateTopicDto
from typing import List
from swarm import Swarm, Agent
from dotenv import load_dotenv

from pydantic import BaseModel


import streamlit as st
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

chat_history = [AIMessage(content="Hello, I'm a bot. How can I help you today?"), HumanMessage(content="You will make a list of topics that is needed to be learnt. If not given any specific instruction generate a topic list based on the website given. List only the topics starting with number bulletins.")]

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


vector_store_cache = {}

class QueryRequest(BaseModel):
    website_url: str
    question: str

class QueryResponse(BaseModel):
    response: str


# import os
# os.environ["OPENAI_API_KEY"] = "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"
# api_key = os.getenv("OPENAI_API_KEY")


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


@router.post("/create_from_web")
async def chat_with_website(query: QueryRequest):
    website_url = query.website_url
    question = query.question

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
        response = get_response(question, vector_store=vector_store)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    return QueryResponse(response=response)

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