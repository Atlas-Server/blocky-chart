FROM node:16-alpine

WORKDIR /controller/app/

COPY package*.json ./

COPY src/ ./src/

RUN npm install

CMD ["npm", "run", "start"]