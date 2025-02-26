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

FROM nginx:1.19.3-alpine

RUN cat /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/dist /usr/share/nginx/html/

EXPOSE 80
