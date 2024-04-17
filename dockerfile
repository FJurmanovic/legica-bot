# Use oven/bun as parent image
FROM oven/bun:1.0.27

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY package.json ./
COPY bun.lockb ./
COPY src ./src
COPY tsconfig.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Expose application port
EXPOSE 3000

# Start the application
CMD ["bun", "start"]