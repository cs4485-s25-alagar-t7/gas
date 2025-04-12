FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Clean install (inside container only!)
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
