from swarm import Swarm, Agent
from dotenv import load_dotenv
import uvicorn

load_dotenv()


# Initialize Swarm client
client = Swarm()

topic_agent_advanced = Agent(
    instructions=f"You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. The user want to learn everything in depth and advanced. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 8 and 9."
)

topic_agent_beginner = Agent(
    instructions=f"You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. The user is a beginner. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 15 and 20."
)

def transfer_to_topic_advanced():
    return topic_agent_advanced 

def transfe_to_topic_beginner():
    return topic_agent_beginner


topic_agent = Agent(
    functions=[transfer_to_topic_advanced, transfe_to_topic_beginner],
    instructions=f"You will generate topic list that are needed to learn a programming language that the user wants to learn. Create a topic list for the user. Consider his age and prior experience in coding. Just generate the topic list with numbered bullets. Show only the topic name. Make sure the number of topics are between 8 and 9."
)


code_explanation_agent = Agent(
    instructions=f"You will be given a code. Explain the code line by line. Also in the beginning, tell the user what the code does in a short description. give them an easier version of code if needed."
)

text_explanation_agent = Agent(
    instructions=f"You will be given  a text. User will ask you question what  the user didn't understand from that text. Make them understand it by giving metaphors or real life examples. "
)

def transfer_to_code_explanation_agent():
    return code_explanation_agent


def transfer_to_text_explanation_agent():
    return text_explanation_agent


content_theory_agent = Agent(
    instructions=f"You will explain the topic given to you considering the user's age and experience. Don't say welcome or hi. Just start with explaining with metaphors or real world examples. Don't show any code of that topic. Try to make him understand the concept of the topic. Also consider the preference of the user when generating the documentation."
)

content_code_agent = Agent(
    instructions=f"You will generate 5 coding examples on the topic you are given for the user to learn considering the user's preference.Don't say welcome or hi or things like 'That's a great choice'. Just start with the code. "
)

content_syntax_agent = Agent(
    instructions=f"You will explain the user the syntax of a given topic considering the user's preference. If the topic doesn't have any coding concept then just return NULL. Don't say welcome or hi or things like 'That's a great choice'."
)


teacher_agent = Agent(
    functions=[transfer_to_code_explanation_agent, transfer_to_text_explanation_agent], 
    instructions=f"You are a great teacher. Help user to understand code or text."
)

