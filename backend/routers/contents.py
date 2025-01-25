# from langchain_core.messages import AIMessage, HumanMessage
# from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.vectorstores import Chroma
# from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain.chains import create_history_aware_retriever, create_retrieval_chain
# from langchain.chains.combine_documents import create_stuff_documents_chain

# # Chat history for conversational context
# chat_history = [
#     AIMessage(content="Hello, I'm a bot. How can I help you today?"),
#     HumanMessage(content="You will be making a summary content or elaborated content based on a topic from the website or PDF.")
# ]

# # Function to process documents from URLs or PDFs
# def process_documents(sources):
#     documents = []

#     for source in sources:
#         if source.endswith('.pdf'):
#             loader = PyPDFLoader(source)
#         else:
#             loader = WebBaseLoader(source)
#         documents.extend(loader.load())

#     text_splitter = RecursiveCharacterTextSplitter()
#     document_chunks = text_splitter.split_documents(documents)
#     vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())

#     return vectorstore

# # Function to create retriever chain
# def get_context_retriever_chain(vectorstore):
#     llm = ChatOpenAI()
#     retriever = vectorstore.as_retriever()
#     prompt = ChatPromptTemplate.from_messages([
#         MessagesPlaceholder(variable_name="chat_history"),
#         ("user", "{input}"),
#         ("user", "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation")
#     ])
#     retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

#     return retriever_chain

# # Function to create conversational retrieval-augmented generation (RAG) chain
# def get_conversational_rag_chain(retriever_chain):
#     llm = ChatOpenAI()
#     prompt = ChatPromptTemplate.from_messages([
#         ("system", "Answer the user's questions based on the below context:\n\n{context}"),
#         MessagesPlaceholder(variable_name="chat_history"),
#         ("user", "{input}"),
#     ])
#     stuff_documents_chain = create_stuff_documents_chain(llm, prompt)

#     return create_retrieval_chain(retriever_chain, stuff_documents_chain)

# # Function to get a response for the user query
# def get_response(user_query, vector_store):
#     retriever_chain = get_context_retriever_chain(vector_store)
#     conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
#     response = conversation_rag_chain.invoke({
#         "chat_history": chat_history,
#         "input": user_query
#     })

#     return response["answer"]

# # Example usage
# if __name__ == "__main__":
#     sources = [
#         "https://example.com",  # Replace with actual website URL
#         "example.pdf"           # Replace with actual PDF file path
#     ]

#     user_query = "Explain the main topic in detail."

#     try:
#         vector_store = process_documents(sources)
#         response = get_response(user_query, vector_store)
#         print("Response:", response)
#     except Exception as e:
#         print("An error occurred:", str(e))

from langchain_openai import ChatOpenAI
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
import random

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o")

# Setup text splitter
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Create system prompt
system_prompt = (
    "You are a mentor who teaches step-by-step, interactively, and adaptively. "
    "Use the provided context to explain the topic clearly. After each explanation, "
    "ask the user a relevant question to ensure they are following. If the user doesn't understand, "
    "re-explain with a simpler approach. Provide practical examples or challenges to reinforce learning. "
    "If the user performs poorly, adapt and try another approach. Continue teaching until the user understands."
)

# Create prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

def process_documents(sources):
    documents = []

    for source in sources:
        if source.endswith('.pdf'):
            loader = PyPDFLoader(source)
        else:
            loader = WebBaseLoader(source)
        documents.extend(loader.load())

    document_chunks = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(document_chunks, OpenAIEmbeddings())

    return vectorstore.as_retriever()

# Function to test the user's understanding
def test_user(topic, llm):
    questions_prompt = f"Generate 3 questions to test the user's understanding of '{topic}'."
    questions = llm.generate({"input": questions_prompt})["answer"]

    print("Let's test your understanding!")
    for idx, question in enumerate(questions.split("\n"), start=1):
        print(f"Question {idx}: {question}")
        user_answer = input("Your Answer: ").strip().lower()
        if "correct" in user_answer or "yes" in user_answer:
            print("Great job! You got it right!")
        else:
            print("Hmm, that's not correct. Let's go over this again.")

# Main function to facilitate teaching
def teach_topic(sources, topic):
    retriever = process_documents(sources)
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    while True:
        # Teach and explain
        results = rag_chain.invoke({"input": topic})
        explanation = results["answer"]
        print(f"\nExplanation:\n{explanation}")

        # Test user understanding
        test_user(topic, llm)

        # Check user progress
        user_feedback = input("\nDo you feel confident about this topic now? (yes/no): ").strip().lower()
        if user_feedback == "yes":
            print("Great! You've mastered this topic. Moving on to the next!")
            break
        else:
            print("No worries, let's go over it again with a simpler explanation.")

# Specify sources
sources = [
    "/home/ubantu/vivasoft/CodeMentor/backend/routers/Tutorial_EDIT.pdf",
    "https://en.wikipedia.org/wiki/Cat"
]

# Example usage
topic = "Teach me about loops"
teach_topic(sources, topic)
