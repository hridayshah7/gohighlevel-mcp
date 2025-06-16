FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# DEBUG: Check if the build was successful
RUN echo "=== CHECKING BUILD OUTPUT ==="
RUN ls -la
RUN echo "=== CHECKING DIST DIRECTORY ==="
RUN ls -la dist/ || echo "❌ dist/ directory not found"
RUN echo "=== CHECKING http-server.js FILE ==="
RUN test -f dist/http-server.js && echo "✅ http-server.js exists" || echo "❌ http-server.js missing"

# DEBUG: Show file content (first 30 lines)
RUN echo "=== SHOWING FILE CONTENT ==="
RUN head -30 dist/http-server.js || echo "❌ Cannot read http-server.js"

# DEBUG: Check file permissions
RUN echo "=== FILE PERMISSIONS ==="
RUN ls -la dist/http-server.js || echo "❌ File not accessible"

# DEBUG: Test if Node can parse the file
RUN echo "=== TESTING NODE SYNTAX ==="
RUN node -c dist/http-server.js && echo "✅ Syntax is valid" || echo "❌ Syntax error in file"

ENV NODE_ENV=production

# DEBUG: Show what we're about to execute
RUN echo "=== FINAL COMMAND WILL BE ==="
RUN echo "node dist/http-server.js"

CMD ["node", "dist/http-server.js"]
RUN echo "✅ Ready to start MCP server on PORT $PORT"
