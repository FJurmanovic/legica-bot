# Use oven/bun as parent image
FROM oven/bun:latest

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY . .

# Install dependencies
RUN bun install

# Expose application port
EXPOSE 3000

# Start the application
CMD bun start