ARG NODE_PARENT=node:18-alpine

FROM  ${NODE_PARENT} as frontend

ARG VITE_SCICRUNCH_API_KEY 

ENV BUILDDIR=/app

RUN apk add git

WORKDIR ${BUILDDIR}
COPY package.json ${BUILDDIR}
COPY yarn.lock ${BUILDDIR}
COPY nginx/default.conf ${BUILDDIR}

RUN yarn install
COPY . ${BUILDDIR}

RUN echo "VITE_SCICRUNCH_API_KEY=${VITE_SCICRUNCH_API_KEY}" > ${BUILDDIR}/.env

RUN yarn build

# Use the existing base image
FROM nginx:alpine

RUN cat /etc/nginx/conf.d/default.conf

# Remove the auto-update script that modifies default.conf
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

# Copy the existing configurations
COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/dist /usr/share/nginx/html/

# Copy API Proxy (server.js)
COPY proxy/server.js /app/server.js
COPY package.json /app/
RUN cd /app && npm install --only=production

# Ensure proper file permissions
RUN chmod 644 /etc/nginx/conf.d/default.conf

# Expose both Nginx (80) and Express (3000)
EXPOSE 80 3000

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
