# Use Node 16 alpine as parent image
FROM node:16-alpine

# Change the working directory on the Docker image to /app
WORKDIR /app

# Copy package.json and package-lock.json to the /app directory
COPY . .

# Install dependencies
RUN npm install
RUN npm run build

# Expose application port
# EXPOSE 3000

# Start the application
CMD npm start