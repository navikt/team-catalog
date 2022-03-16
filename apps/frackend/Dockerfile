FROM navikt/node-express:16-alpine

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY src/ src/
COPY public/ public/
COPY .env .env

EXPOSE 8080
ENTRYPOINT ["node", "src/index.js"]
