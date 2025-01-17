# CodeMentor

In today’s fast-paced tech landscape, beginner coders often find themselves overwhelmed with the vast amount of information available online. They struggle to create a structured learning path, face challenges understanding complex concepts, and lack immediate, context-sensitive assistance when learning to code. This lack of personalized mentorship often leads to frustration and a slowed learning process.

CodeMentor is designed to bridge these gaps by offering an AI-powered, interactive learning platform that personalizes the learning experience for each user. With features tailored to beginners, it provides a structured roadmap, instant content generation, real-time code feedback, and mentorship—making learning both easier and more engaging.

## Technical Documentation and Demonstration Video
[Technical Documentation.](https://docs.google.com/document/d/1nrV6MDjtKjIvcTu4MP6rfeH-4dtHlxKB60Ujx3i25fw/edit?usp=sharing)\
[Demonstration Video.](https://drive.google.com/file/d/1Q9NrAw2ibKMKaH7H8r93Cpr6N4MOZ3Xb/view?usp=sharing)



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

