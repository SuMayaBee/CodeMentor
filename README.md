# CodeMentor

In today’s fast-paced tech landscape, beginner coders often find themselves overwhelmed with the vast amount of information available online. They struggle to create a structured learning path, face challenges understanding complex concepts, and lack immediate, context-sensitive assistance when learning to code. This lack of personalized mentorship often leads to frustration and a slowed learning process.

![Screenshot 2025-01-17 235458](https://github.com/user-attachments/assets/ea416e41-d653-4a9f-aa11-92cb19d80e02)


CodeMentor is designed to bridge these gaps by offering an AI-powered, interactive learning platform that personalizes the learning experience for each user. With features tailored to beginners, it provides a structured roadmap, instant content generation, real-time code feedback, and mentorship—making learning both easier and more engaging. Here's how it works:


<div align="center">

## 1. User Roadmap Creation:

</div>


**Feature Description:** Users can create personalized roadmaps for learning a specific programming language or concept, such as "I want to learn C++." The roadmap consists of a list of topics (e.g., syntax, loops, functions) tailored to the user's learning journey.

![Screenshot 2025-01-17 234545](https://github.com/user-attachments/assets/ef1c401e-26e8-4cb3-8d37-6d714cd2a601)


**Stack Usage:**
- **Frontend (Next.js):** Users input their desired learning path, and the frontend sends a request to the backend to generate the roadmap.
- **Backend (FastAPI):** FastAPI handles the incoming request, triggering the Roadmap Agent (powered by OpenAI Swarm) to generate a topic list for the selected language.
- **Database (PostgreSQL):** The generated roadmap (topics) is stored in PostgreSQL under the user's profile for easy retrieval.
- **Prisma:** Prisma ORM interacts with PostgreSQL to efficiently manage and query the user’s roadmap data.

<div align="center">
## 2. Content Generation (Theory, Syntax, Example Code):
</div>

**Feature Description:** Once the user selects a specific topic (e.g., Python loops), the platform generates detailed content, including theory, syntax, and example code.

![Screenshot 2025-01-17 234725](https://github.com/user-attachments/assets/b4d03347-c242-4f15-98db-07b8f1cf010b)

![Screenshot 2025-01-17 234742](https://github.com/user-attachments/assets/042a09a8-1287-459b-868f-aadd766fdbe5)


**Stack Usage:**
- **Frontend (Next.js):** The user selects a topic, and the frontend requests content generation via the backend. The request includes the topic for which content (theory, syntax, example) needs to be created.
- **Backend (FastAPI):** FastAPI routes the request to the respective agents:
  - **Theory Agent:** Generates detailed theory about the topic.
  - **Syntax Agent:** Provides the syntax of the concept.
  - **Example Code Agent:** Generates relevant code examples.
- **Database (PostgreSQL):** Each piece of content (theory, syntax, and example) is saved in the database, associating it with the user’s profile and selected topic.
- **Prisma:** Prisma is used to manage and query content stored in the database, ensuring smooth fetching and updating of content.

<div align="center">
## 3. Code Editor and CodeMentor:
</div>

**Feature Description:** The platform provides a code editor (Monaco Editor) where users can write code. They can select a portion of the code and ask specific questions. The system will process the query and provide feedback, helping them learn.

![Screenshot 2025-01-17 235222](https://github.com/user-attachments/assets/0f504a5c-8ea1-45aa-82d3-b9a254f2153f)


**Stack Usage:**
- **Frontend (Next.js + Monaco Editor):** Monaco Editor is embedded in the frontend, enabling users to write and edit code. The user selects a portion of the code and submits a question.
- **Backend (FastAPI):** FastAPI handles the query by sending it to the Mentorship Agent from OpenAI Swarm, which processes the selected code and generates an answer.
- **Database (PostgreSQL):** The Q&A interaction (question and response) is saved in PostgreSQL, allowing the user to refer back to it later.
- **Prisma:** Prisma is used to save the user’s code snippets and interactions into the database for future retrieval.

<div align="center">
## 4. Code Mentorship Agent:
</div>

**Feature Description:** Users can ask questions about specific parts of their code. The system identifies the selected code, processes the question, and provides relevant guidance, explanations, or suggestions.

![Screenshot 2025-01-17 235305](https://github.com/user-attachments/assets/31fef5eb-7d8c-4b5a-8ab6-3b1029a6d537)


**Stack Usage:**
- **Frontend (Next.js + Monaco Editor):** The Monaco Editor allows users to highlight a piece of code and ask a question about it. The request is sent to the backend.
- **Backend (FastAPI):** FastAPI handles the request and passes it to the Mentorship Agent for analysis. The agent responds with feedback or clarification on the selected code.
- **Database (PostgreSQL):** User-generated questions and the feedback received are stored in the database for reference and can be revisited by the user later.
- **Prisma:** Prisma is used for efficient database operations, ensuring that questions, responses, and code snippets are stored and retrieved smoothly.

<div align="center">
## 5. User Authentication and Profile Management:
</div>

**Feature Description:** Users can create accounts, log in, and store their learning progress, including roadmaps, content, and interactions. Each user has a personalized profile to track their learning journey.

**Stack Usage:**
- **Frontend (Next.js + Clerk):** Clerk is used for handling user authentication. It provides a seamless login, registration, and session management experience. The frontend integrates Clerk's API to authenticate users and manage their sessions.
- **Backend (FastAPI):** FastAPI processes authentication tokens provided by Clerk for secure access to user data.
- **Database (PostgreSQL):** User profiles, credentials, and learning data (roadmaps, content, Q&A) are stored securely in PostgreSQL.
- **Prisma:** Prisma ORM is used to interact with PostgreSQL, ensuring efficient data retrieval and updates related to user profiles and learning progress.



https://github.com/user-attachments/assets/ce2bbc40-905f-4bcf-b1e8-2e3a39d025b8



## Technical Documentation and Demonstration Video
[Technical Documentation.](https://docs.google.com/document/d/1nrV6MDjtKjIvcTu4MP6rfeH-4dtHlxKB60Ujx3i25fw/edit?usp=sharing)\
[Demonstration Video.](https://drive.google.com/file/d/1XSD-Qzh8dePoEGp-F5P4Sjg_LL9fOj7D/view)


## Prerequisites

Before you start, ensure that you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/SuMayaBee/CodeMentor.git
   cd https://github.com/SuMayaBee/CodeMentor.git
   ```

2. Create a `.env` file in the project root directory (where `docker-compose.yaml` is located) and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```



3. Build the Docker images:
   ```bash
   docker compose build
   ```

4. Start the services:
   ```bash
   docker compose up
   ```

   The frontend and backend will now be running. You can access them at the URLs specified in the `docker-compose.yaml` file (commonly `http://localhost:3000` for the frontend and `http://localhost:8000` for the backend).

## Teammates

The CodeMentor project was developed by the following team members:

- **MD Tamim Sarkar** - Team Lead, Role: AI and Backend [Linkedin](https://www.linkedin.com/in/tam1m/)
- **Sumaiya Islam** - Member, Role: Frontend and Backend [Linkedin](https://www.linkedin.com/in/sumaiya-islam-freelancer/)
- **Fabliha Sarwar** - Member, Role: Backend [Linkedin](https://www.linkedin.com/in/fabliha-afaf-sarwar/)
- **Abdullah Al Jilan** - Member, Role: Backend [Linkedin](https://www.linkedin.com/in/abdullah-all-jilan/)

Feel free to add or update your details in this section!

## Troubleshooting

- Ensure that your `.env` file is correctly placed and contains a valid `OPENAI_API_KEY`.
- Check that Docker and Docker Compose are correctly installed and running on your machine.
- If you encounter issues, try stopping the containers with `docker compose down` and restarting them with `docker compose up`.

## Feedback and Contributions

We welcome contributions and feedback! Feel free to open an issue or submit a pull request to improve the project.

