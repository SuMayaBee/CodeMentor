from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.messages import AIMessage, HumanMessage
import os

from fastapi import APIRouter, HTTPException

# Initialize variables
global retriever
retriever = None

router = APIRouter(prefix="/newcontent", tags=["newcontent"])


llm = ChatOpenAI(model="gpt-4o")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Request Models
class SourceInput(BaseModel):
    sources: list[str]

class ChatInput(BaseModel):
    prompt: str
    chat_history: list[dict]

# Helper Functions
def process_documents(sources):
    documents = []
    for source in sources:
        if source.endswith(".pdf"):
            loader = PyPDFLoader(source)
        else:
            loader = WebBaseLoader(source)
        documents.extend(loader.load())

    document_chunks = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())
    return vectorstore.as_retriever()

def get_conversational_rag_chain(retriever):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the user's questions based on the below context:\n\n{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever, stuff_documents_chain)

def get_context_retriever_chain(retriever):
    prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Based on the conversation, generate a search query to get relevant information."),
    ])
    return create_history_aware_retriever(llm, retriever, prompt)

# API Endpoints
@router.post("/load_sources")
async def load_sources(input: SourceInput):
    global retriever
    try:
        retriever = process_documents(input.sources)
        return {"message": "Sources processed and retriever initialized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sources: {str(e)}")

@router.post("/chat")
async def chat(input: ChatInput):
    global retriever
    if retriever is None:
        raise HTTPException(status_code=400, detail="Retriever not initialized. Please load sources first.")

    try:
        # Reconstruct chat history
        chat_history = [
            AIMessage(content=msg["content"]) if msg["role"] == "ai" else HumanMessage(content=msg["content"])
            for msg in input.chat_history
        ]

        # Generate response
        retriever_chain = get_context_retriever_chain(retriever)
        conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
        response = conversation_rag_chain.invoke({
            "chat_history": chat_history,
            "input": input.prompt,
        })

        # Update chat history
        chat_history.append(HumanMessage(content=input.prompt))
        chat_history.append(AIMessage(content=response["answer"]))

        # Return updated history and response
        return {
            "response": response["answer"],
            "chat_history": [
                {"role": "ai" if isinstance(msg, AIMessage) else "human", "content": msg.content}
                for msg in chat_history
            ],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
