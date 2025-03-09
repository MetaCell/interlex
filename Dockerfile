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

# Ensure proper file permissions
RUN chmod 644 /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

