FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY src/ src/
RUN npm install -g ts-node typescript @types/node @types/express @types/pg
EXPOSE 3000
CMD ["ts-node", "src/server.ts"]
