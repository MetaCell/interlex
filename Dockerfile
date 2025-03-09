# Build Stage 1: Node.js for Frontend and API Server
ARG NODE_PARENT=node:18-alpine
FROM ${NODE_PARENT} as frontend

ARG VITE_SCICRUNCH_API_KEY 

ENV BUILDDIR=/app

RUN apk add --no-cache git

WORKDIR ${BUILDDIR}

# Copy dependencies and install
COPY package.json yarn.lock ${BUILDDIR}/
RUN yarn install

# Copy everything else
COPY . ${BUILDDIR}/

# Set up environment for Vite build
ENV VITE_SCICRUNCH_API_KEY=${VITE_SCICRUNCH_API_KEY}

RUN yarn build

# Build Stage 2: Final Image with Nginx and Node.js
FROM nginx:alpine

# Install Node.js for API Proxy
RUN apk add --no-cache nodejs npm

# Set up directories
WORKDIR /app

# Copy frontend build
COPY --from=frontend /app/dist /usr/share/nginx/html/

# Copy Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy API Proxy (server.js)
COPY proxy/server.js /app/server.js

# Install dependencies for server.js
RUN npm install express http-proxy-middleware cors dotenv

# Ensure permissions are correct
RUN chmod 644 /etc/nginx/conf.d/default.conf

# Expose both Nginx (80) and Express (3000)
EXPOSE 80 3000

# Install tini for better process management
RUN apk add --no-cache tini

# Use tini as the init system to manage both processes
ENTRYPOINT ["/sbin/tini", "--"]

# Start both Express and Nginx
CMD ["sh", "-c", "node /app/server.js & nginx -g 'daemon off;'"]

