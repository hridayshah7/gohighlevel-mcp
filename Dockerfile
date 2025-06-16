FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
ENV MCP_MODE=http
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/hybrid-server.js"]