FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies  
RUN npm ci --only=production

# Copy source code
COPY . .

# Show what files we have before build
RUN echo "=== FILES BEFORE BUILD ===" && ls -la src/

# Build TypeScript
RUN npm run build

# Show what files we have after build
RUN echo "=== FILES AFTER BUILD ===" && ls -la dist/

# Verify the hybrid server was built
RUN test -f dist/hybrid-server.js && echo "✅ hybrid-server.js found" || echo "❌ hybrid-server.js missing"

# Show the package.json main field
RUN echo "=== PACKAGE.JSON MAIN FIELD ===" && cat package.json | grep -A 2 -B 2 "main"

# Show the package.json start script
RUN echo "=== PACKAGE.JSON START SCRIPT ===" && cat package.json | grep -A 5 "scripts"

# Test the hybrid server syntax
RUN echo "=== TESTING HYBRID SERVER SYNTAX ===" && node -c dist/hybrid-server.js && echo "✅ Syntax valid" || echo "❌ Syntax error"

# Show first few lines of hybrid server
RUN echo "=== HYBRID SERVER CONTENT (first 10 lines) ===" && head -10 dist/hybrid-server.js

# Set environment variables for Railway deployment
ENV MCP_MODE=http
ENV NODE_ENV=production

# Show environment variables
RUN echo "=== ENVIRONMENT VARIABLES ===" && printenv | grep -E "(MCP_MODE|NODE_ENV|PORT)"

# Expose port (Railway sets PORT automatically)
EXPOSE 8080

# Show final command that will be executed
RUN echo "=== FINAL START COMMAND ===" && echo "npm start will execute: node dist/hybrid-server.js"

# Start the hybrid server
CMD ["npm", "start"]