from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain


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

# Chat history for conversational context
chat_history = [
    AIMessage(content="Hello, I'm a bot. How can I help you today?"),
    HumanMessage(content="You will be making a summary content or elaborated content based on a topic from the website or PDF.")
]

# Function to process documents from URLs or PDFs
def process_documents(sources):
    documents = []


    for source in sources:
        if source.endswith('.pdf'):
            loader = PyPDFLoader(source)
        else:
            loader = WebBaseLoader(source)
        documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter()
    document_chunks = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())


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
    

    return vectorstore

# Function to create retriever chain
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

# Function to create conversational retrieval-augmented generation (RAG) chain
def get_conversational_rag_chain(retriever_chain):
    llm = ChatOpenAI()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the user's questions based on the below context:\n\n{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)

    return create_retrieval_chain(retriever_chain, stuff_documents_chain)

# Function to get a response for the user query
def get_response(user_query, vector_store):
    retriever_chain = get_context_retriever_chain(vector_store)
    conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
    response = conversation_rag_chain.invoke({
        "chat_history": chat_history,
        "input": user_query
    })

    return response["answer"]

# Example usage
if __name__ == "__main__":
    sources = [
        "https://example.com",  # Replace with actual website URL
        "example.pdf"           # Replace with actual PDF file path
    ]

    user_query = "Explain the main topic in detail."


    try:
        vector_store = process_documents(sources)
        response = get_response(user_query, vector_store)
        print("Response:", response)
    except Exception as e:
        print("An error occurred:", str(e))


