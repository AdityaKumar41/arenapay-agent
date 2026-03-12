FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm install
COPY src ./src/
RUN npx prisma generate
RUN npx tsc

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
