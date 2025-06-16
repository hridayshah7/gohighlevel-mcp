FROM node:18-alpine

WORKDIR /app

# Copy package files for production dependencies only
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the pre-built dist folder and other necessary files
COPY dist/ ./dist/
COPY .env* ./

# Set environment variables
ENV MCP_MODE=http
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the server directly
CMD ["node", "dist/hybrid-server.js"]