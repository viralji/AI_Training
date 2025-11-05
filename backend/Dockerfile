# Backend Dockerfile
FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for better-sqlite3 build)
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && \
    chmod 755 uploads

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]

