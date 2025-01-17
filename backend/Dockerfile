# Use an official Python image as the base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

ENV DATABASE_URL=postgresql://neondb_owner:pOhY1VrFUw8m@ep-black-scene-a1qxsve5.ap-southeast-1.aws.neon.tech/cloudcode?sslmode=require


# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && apt-get clean

# Copy the backend code into the container
COPY . .

# Install Python dependencies
RUN pip install -r requirements.txt

# Expose the backend port
EXPOSE 8000

# Generate Prisma Client
RUN prisma generate

# Command to run the application
CMD ["python", "main.py"]
