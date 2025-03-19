# Use the official Alpine Linux base image
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Update package index and install Node.js and npm
RUN apk update && apk add --no-cache nodejs npm

# Copy package.json (and package-lock.json if it exists) to the working directory
COPY package.json ./
COPY package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Start the application
CMD ["npm", "start"]