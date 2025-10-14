# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port 5000 for server 
EXPOSE 5000

# Start server in development mode (with hot reload)
CMD ["npm", "run", "start:dev"]
