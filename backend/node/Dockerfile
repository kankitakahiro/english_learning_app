FROM node:18.17.1-slim

WORKDIR /app

COPY package*.json ./

# RUN npm init -y 
# RUN npm install express 
RUN apt-get update && apt-get install -y vim
RUN npm install

COPY . .

EXPOSE 8080

# CMD ["node", "src/server.js"]
CMD ["npm", "start"]