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
CMD ["nginx", "-g", "daemon off;"]
