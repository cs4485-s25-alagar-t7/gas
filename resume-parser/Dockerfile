# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the typescript files
RUN npm run build

# Expose port 5001
EXPOSE 5001

WORKDIR /app

# Start the application
CMD ["npm", "run", "start"]
