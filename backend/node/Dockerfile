FROM node:18.17.1-slim

WORKDIR /app

COPY package*.json ./

# RUN npm init -y 
# RUN npm install express 
RUN apt-get update && apt-get install -y vim
RUN npm install

# ENV NODE_ENV=production

COPY . .

ENV GOOGLE_APPLICATION_CREDENTIALS=./vision-398320-5a992653e5ca.json
ENV INSTANCE_HOST='db'
ENV CONNECTION_LIMIT='10'
ENV DB_PORT='3306'
ENV DB_NAME='vision-db'
ENV DB_USER='talps'
ENV DB_PASS='huckutalps'

EXPOSE 8080

# CMD ["node", "src/server.js"]
CMD ["npm", "start"]