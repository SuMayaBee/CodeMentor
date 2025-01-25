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