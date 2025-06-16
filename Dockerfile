FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy rest of the code
COPY . .

# Build TypeScript project
RUN npm run build

# DEBUG: Check if the build was successful
RUN echo "=== CHECKING BUILD OUTPUT ==="
RUN ls -la

RUN echo "=== CHECKING DIST DIRECTORY ==="
RUN ls -la dist/ || echo "❌ dist/ directory not found"

RUN echo "=== CHECKING server.js FILE ==="
RUN test -f dist/server.js && echo "✅ server.js exists" || echo "❌ server.js missing"

RUN echo "=== CHECKING http-server.js FILE ==="
RUN test -f dist/http-server.js && echo "✅ http-server.js exists" || echo "❌ http-server.js missing"

# DEBUG: Show file content (first 30 lines) of server.js
RUN echo "=== SHOWING server.js CONTENT ==="
RUN head -30 dist/server.js || echo "❌ Cannot read server.js"

# DEBUG: Check file permissions
RUN echo "=== FILE PERMISSIONS ==="
RUN ls -la dist/server.js || echo "❌ server.js not accessible"
RUN ls -la dist/http-server.js || echo "❌ http-server.js not accessible"

# DEBUG: Test if Node can parse the files
RUN echo "=== TESTING NODE SYNTAX ==="
RUN node -c dist/server.js && echo "✅ server.js syntax is valid" || echo "❌ Syntax error in server.js"
RUN node -c dist/http-server.js && echo "✅ http-server.js syntax is valid" || echo "❌ Syntax error in http-server.js"

# Set environment
ENV NODE_ENV=production

# Expose port for HTTP server (if using http-server.js)
EXPOSE 8000

# DEBUG: Show startup command
RUN echo "=== FINAL COMMAND WILL BE ==="
RUN echo "node dist/server.js"

# IMPORTANT: Choose the right server for your deployment
# For Claude Desktop (stdio): use server.js
# For Railway/web deployment: use http-server.js

# Default to stdio server (for Claude Desktop)
CMD ["node", "dist/server.js"]

# Alternative: For Railway deployment, use this instead:
# CMD ["node", "dist/http-server.js"]

# Final debug
RUN echo "✅ Ready to start MCP server"