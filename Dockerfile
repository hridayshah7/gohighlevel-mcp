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

# Check for all possible server files
RUN echo "=== CHECKING SERVER FILES ==="
RUN test -f dist/hybrid-server.js && echo "✅ hybrid-server.js exists" || echo "❌ hybrid-server.js missing"
RUN test -f dist/server.js && echo "✅ server.js exists" || echo "❌ server.js missing"
RUN test -f dist/http-server.js && echo "✅ http-server.js exists" || echo "❌ http-server.js missing"

# Create a startup script that handles multiple scenarios
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'export MCP_MODE=http' >> /app/start.sh && \
    echo 'export NODE_ENV=production' >> /app/start.sh && \
    echo 'export PORT=${PORT:-8080}' >> /app/start.sh && \
    echo 'echo "🚀 Starting GoHighLevel MCP Server..."' >> /app/start.sh && \
    echo 'echo "Environment: MCP_MODE=$MCP_MODE, PORT=$PORT"' >> /app/start.sh && \
    echo 'if [ -f "dist/hybrid-server.js" ]; then' >> /app/start.sh && \
    echo '  echo "✅ Starting hybrid server..."' >> /app/start.sh && \
    echo '  exec node dist/hybrid-server.js' >> /app/start.sh && \
    echo 'elif [ -f "dist/http-server.js" ]; then' >> /app/start.sh && \
    echo '  echo "✅ Starting HTTP server..."' >> /app/start.sh && \
    echo '  exec node dist/http-server.js' >> /app/start.sh && \
    echo 'elif [ -f "dist/server.js" ]; then' >> /app/start.sh && \
    echo '  echo "✅ Starting server with HTTP mode..."' >> /app/start.sh && \
    echo '  exec node dist/server.js' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "❌ No server file found!"' >> /app/start.sh && \
    echo '  ls -la dist/' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    chmod +x /app/start.sh

# Show the startup script
RUN echo "=== STARTUP SCRIPT ===" && cat /app/start.sh

# Set environment variables for HTTP mode (web deployment)
ENV MCP_MODE=http
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start using the fallback script
CMD ["/app/start.sh"]