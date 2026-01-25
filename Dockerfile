
# Stage 1: Build the Frontend
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine as production-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend from Stage 1
COPY --from=build-stage /app/dist ./dist
# Copy backend source
COPY server.cjs .
COPY database.cjs .
# Copy public folder structure if needed (though it might be empty initially)
COPY public ./public

# Create providers directory ensuring it exists
RUN mkdir -p public/providers

ENV NODE_ENV=production
# Expose the backend port
EXPOSE 3001

CMD ["node", "server.cjs"]
