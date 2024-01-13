FROM node:19 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build build already post-install

FROM node:19-alpine

WORKDIR /app

EXPOSE 3000

COPY --from=builder /app ./

ENTRYPOINT ["npm", "run", "start:prod"]