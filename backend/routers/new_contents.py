from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader, YouTubeLoader
from langchain.chains import create_history_aware_retriever
from langchain_core.messages import AIMessage, HumanMessage


# Initialize LLM
llm = ChatOpenAI(model="gpt-4o")

# Setup text splitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Create system prompt
system_prompt = (
    "You are a mentor who teaches step-by-step, interactively and adaptively. "
    "Use the provided context to explain the topic clearly. After each explanation, "
    "ask the user a relevant question to ensure they are following. Your questions "
    "should be conversational and engaging, not robotic. If the user doesn't understand, "
    "re-explain with a simpler approach. Keep explanations concise (three sentences max)."
    "Ask the user if they understood a topic. If they did, advance with the topic. Then after giving them the basics, "
    "show some coding examples and ask quizzes. If they answer correctly, go further. If they answer wrong, repeat the explanation."
)

# Process documents, including handling YouTube links
def process_documents(sources):
    documents = []

    for source in sources:
        if source.endswith(".pdf"):
            loader = PyPDFLoader(source)
        elif "youtube.com" in source or "youtu.be" in source:
            loader = YouTubeLoader(source)
        else:
            loader = WebBaseLoader(source)
        documents.extend(loader.load())

    document_chunks = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())

    return vectorstore.as_retriever()

# Create a conversational RAG chain
def get_conversational_rag_chain(retriever):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Answer the user's questions based on the below context:\n\n{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ])
    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)
    return create_retrieval_chain(retriever, stuff_documents_chain)

# Create a context-aware retriever chain
def get_context_retriever_chain(retriever):
    prompt = ChatPromptTemplate.from_messages([
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        ("user", "Based on the conversation, generate a search query to get relevant information."),
    ])
    return create_history_aware_retriever(llm, retriever, prompt)

# Get response from the RAG chain
def get_response(user_query, retriever, chat_history):
    retriever_chain = get_context_retriever_chain(retriever)
    conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
    response = conversation_rag_chain.invoke({
        "chat_history": chat_history,
        "input": user_query,
    })
    return response["answer"]

# Main teaching function
def teach_topic(sources, topic, chat_history=[]):
    # Process sources
    retriever = process_documents(sources)

    # Get response
    response = get_response(topic, retriever, chat_history)
    return response

# Specify sources
sources = [
    "/home/ubantu/vivasoft/CodeMentor/backend/routers/Tutorial_EDIT.pdf",
    "https://en.wikipedia.org/wiki/Cat",
]

retriever = process_documents(sources)


chat_history = [AIMessage(content="You want to learn loops right. I will start from basic by giving you a real world example of loop. then i will ask you question. if you answer correct i will advance to coding. Also if he doesnt understand something. Ask him some question to know his background.")]

while True:

    # Example usage
    prompt = input("Input: ")

    chat_history.append(HumanMessage(content=prompt)) 

    response = teach_topic(sources, prompt, chat_history)
    chat_history.append(AIMessage(content=response)) 
    print(response)