# Use Node.js 18 as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY backend/package.json package.json ./
COPY backend/. .

# Install dependencies with fix for peer dependencies
RUN npm install --legacy-peer-deps

# Copy remaining files
COPY . .

# Expose the port
ENV PORT=3001
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
