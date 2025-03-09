# Use Node.js for building the frontend
ARG NODE_PARENT=node:18-alpine
FROM ${NODE_PARENT} as frontend

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

# Use Node.js for the backend (Express proxy)
FROM node:18-alpine as backend

WORKDIR /proxy
COPY package.json package-lock.json ./
RUN npm install

COPY proxy/server.js .  # Ensure correct path

EXPOSE 3000

# Use Nginx for the frontend
FROM nginx:alpine

# Copy the frontend build output
COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf
COPY --from=frontend /app/dist /usr/share/nginx/html/

# Copy the backend (Express) into the container
COPY --from=backend /proxy /proxy

# Ensure proper file permissions
RUN chmod 644 /etc/nginx/conf.d/default.conf

# Expose Nginx and Express ports
EXPOSE 80 3000

# Start both Nginx and the Express server
CMD ["sh", "-c", "node /proxy/server.js & nginx -g 'daemon off;'"]