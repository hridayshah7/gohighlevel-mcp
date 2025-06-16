FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies  
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Verify the hybrid server was built
RUN test -f dist/hybrid-server.js && echo "✅ hybrid-server.js found" || echo "❌ hybrid-server.js missing"

# Set environment variables for Railway deployment
ENV MCP_MODE=http
ENV NODE_ENV=production

# Expose port (Railway sets PORT automatically)
EXPOSE 8080

# Start the hybrid server
CMD ["npm", "start"]