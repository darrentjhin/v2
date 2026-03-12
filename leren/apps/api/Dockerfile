FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm install --frozen-lockfile
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
RUN mkdir -p uploads
EXPOSE 4000
CMD ["node", "dist/index.js"]
