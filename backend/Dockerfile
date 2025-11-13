FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Generar Prisma Client
RUN pnpm prisma generate

RUN pnpm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package.json ./

COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Ejecutar migraciones y seed antes de iniciar la aplicación
CMD npx prisma migrate deploy && node dist/seed.js && node dist/main.js
