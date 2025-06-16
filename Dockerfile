# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Debug: Check build output
RUN echo "=== CHECKING BUILD OUTPUT ==="
RUN ls -la
RUN echo "=== CHECKING DIST DIRECTORY ==="
RUN ls -la dist/ || echo "❌ dist/ directory not found"

# Check for hybrid server file
RUN echo "=== CHECKING HYBRID SERVER FILE ==="
RUN test -f dist/hybrid-server.js && echo "✅ hybrid-server.js exists" || echo "❌ hybrid-server.js missing"

# Check for original server files (fallback)
RUN test -f dist/server.js && echo "✅ server.js exists" || echo "❌ server.js missing"
RUN test -f dist/http-server.js && echo "✅ http-server.js exists" || echo "❌ http-server.js missing"

# Show file contents for debugging
RUN echo "=== SHOWING HYBRID SERVER CONTENT ==="
RUN head -30 dist/hybrid-server.js || echo "❌ Cannot read hybrid-server.js"

# Test syntax
RUN echo "=== TESTING NODE SYNTAX ==="
RUN node -c dist/hybrid-server.js && echo "✅ hybrid-server.js syntax is valid" || echo "❌ Syntax error in hybrid-server.js"

# Set environment variables for HTTP mode (web deployment)
ENV MCP_MODE=http
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Final check
RUN echo "=== FINAL COMMAND WILL BE ==="
RUN echo "node dist/hybrid-server.js"
RUN echo "✅ Ready to start MCP hybrid server"

# Start the hybrid server
CMD ["node", "dist/hybrid-server.js"]