FROM navikt/node-express:14-alpine

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY src/ src/
COPY ../frontend/build/ public/

EXPOSE 3000
ENTRYPOINT ["node", "src/index.js"]
