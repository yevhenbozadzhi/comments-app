FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

RUN mkdir -p uploads/images uploads/text

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npm start"]
