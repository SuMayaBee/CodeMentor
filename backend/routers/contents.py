from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

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
