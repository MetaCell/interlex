# Build Stage 1: Node.js for Frontend and API Server
ARG NODE_PARENT=node:18-alpine
FROM ${NODE_PARENT} as frontend

ARG VITE_SCICRUNCH_API_KEY 

ENV BUILDDIR=/app

RUN apk add --no-cache git

WORKDIR ${BUILDDIR}
COPY package.json yarn.lock nginx/default.conf ${BUILDDIR}/
RUN yarn install

COPY . ${BUILDDIR}

RUN echo "VITE_SCICRUNCH_API_KEY=${VITE_SCICRUNCH_API_KEY}" > ${BUILDDIR}/.env

RUN yarn build

# Build Stage 2: Final Image with Nginx and Node.js
FROM nginx:alpine

# 🔹 Install Node.js & npm properly
RUN apk add --no-cache nodejs npm

# Set up directories
WORKDIR /app

# Copy frontend build
COPY --from=frontend /app/dist /usr/share/nginx/html/

# Copy Nginx configuration
COPY --from=frontend /app/default.conf /etc/nginx/conf.d/default.conf

# Copy API Proxy (server.js)
COPY proxy/server.js /app/server.js
COPY package.json /app/

# 🔹 Ensure dependencies are installed correctly
RUN cd /app && npm install --only=production

# Ensure permissions are correct
RUN chmod 644 /etc/nginx/conf.d/default.conf

# Expose both Nginx (80) and Express (3000)
EXPOSE 80 3000

# Install tini for better process management
RUN apk add --no-cache tini supervisor

# Create supervisord config file
RUN echo "[supervisord]" > /etc/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisord.conf && \
    echo "[program:nginx]" >> /etc/supervisord.conf && \
    echo "command=nginx -g 'daemon off;'" >> /etc/supervisord.conf && \
    echo "[program:server]" >> /etc/supervisord.conf && \
    echo "command=node /app/server.js" >> /etc/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisord.conf

# Use supervisord to manage both processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]