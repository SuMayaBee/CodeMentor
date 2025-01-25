from fastapi import APIRouter, HTTPException
from prisma import Prisma
from models.topic import CreateTopicDto
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


load_dotenv()

################################ FROM WEB ##########################################################################

chat_history = [AIMessage(content="Hello, I'm a bot. How can I help you today?"), HumanMessage(content="You will create 15 quizes with multiple choices (4 choices). on the topic you are given based on the website. Add 10 informative type question and 5 question that will evaluate if the user understood the topic or not. Only generate questions with number bulletins. dont generate any extra sentences.")]
vector_store_cache = {}
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

class QueryRequest(BaseModel):
    website_url: str
    topic: str 

class EvaluationRequest(BaseModel):
    website_url: str
    wrong_answers: str
    topic: str  

class QueryResponse(BaseModel):
    response: str


router = APIRouter(prefix="/quiz", tags=["quizes"])


@router.post("/create_from_web")
async def chat_with_website(query: QueryRequest):
    website_url = query.website_url
    topic = query.topic

    question = f"Generate me the quiz just like i said on the topic {topic}"
    # Validate input
    if not website_url or not topic:
        raise HTTPException(status_code=400, detail="Both 'website_url' and 'topic' are required.")

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


chat_history = [AIMessage(content="Hello, I'm a bot. How can I help you today?"), HumanMessage(content="You will evaluate which area I need to focus on. I will provide you the question I got wrong in the topic. Give me suggestion as a list of points on which area i should focus on.")]


@router.post("/evaluate")
async def chat_with_website(query: EvaluationRequest):
    website_url = query.website_url
    wrong = query.wrong_answers 
    topic = query.topic 

    question = f"I did mistake on these questions {wrong} and the topic was {topic}."

    # Validate input
    if not website_url or not topic:
        raise HTTPException(status_code=400, detail="Both 'website_url' and 'topic' are required.")

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


chat_history = [AIMessage(content="Hello, I'm a bot. How can I help you today?"), HumanMessage(content="")]


@router.post("/recreate_from_web")
async def chat_with_website(query: EvaluationRequest):
    website_url = query.website_url
    wrong = query.wrong_answers 
    topic = query.topic 

    question = f"I did mistake on these questions {wrong} and the topic was {topic}. You will create 15 quizes with multiple choices (4 choices). on the topic you are given based on the website. Focus on the weak points of the me. Try to give more question on the topic which relates to the questions I got wrong. Only generate questions with number bulletins. dont generate any extra sentences."
    
    # Validate input
    if not website_url or not topic:
        raise HTTPException(status_code=400, detail="Both 'website_url' and 'topic' are required.")

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