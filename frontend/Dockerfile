<<<<<<< HEAD
# Dockerfile for Create React App frontend
FROM node:20-alpine as builder
WORKDIR /app

# Set compatibility flag to fix OpenSSL errors in CRA
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve the build
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000
=======
# Build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Vite app
RUN npm run build


# Serve the built app with a lightweight server
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start Nginx
>>>>>>> a92b44c5c1e096953191b5aa7ca1b3ac2befea91
CMD ["nginx", "-g", "daemon off;"]
