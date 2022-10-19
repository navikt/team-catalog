FROM node:19-alpine

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY src/ src/
COPY public/ public/
COPY public2/ public2/
COPY .env .env

EXPOSE 8080
ENTRYPOINT ["node", "src/index.js"]
