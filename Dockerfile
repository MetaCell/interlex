ARG NODE_PARENT=node:18-alpine

FROM  ${NODE_PARENT} as frontend

ENV BUILDDIR=/app

RUN apk add git

WORKDIR ${BUILDDIR}
COPY package.json ${BUILDDIR}
COPY yarn.lock ${BUILDDIR}
COPY nginx/default.conf ${BUILDDIR}
ARG VITE_SCICRUNCH_API_KEY
ENV VITE_SCICRUNCH_API_KEY=$VITE_SCICRUNCH_API_KEY
ARG VITE_SCICRUNCH_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN echo "VITE_SCICRUNCH_API_KEY=$VITE_SCICRUNCH_API_KEY" > .env
RUN echo "VITE_SCICRUNCH_API_URL=$VITE_API_URL" >> .env

RUN yarn install
COPY . ${BUILDDIR}

# The ~16MB neurdf ontology is deliberately NOT baked in here. Baking it froze the data to build
# time and added 16MB to every image; instead the entrypoint fetches it at container start (see
# below), and the front end reads the source endpoint directly until it lands. Locally, get a copy
# with `yarn fetch-data` — .dockerignore keeps public/data out of the build context either way.
RUN yarn build

FROM nginx:1.19.3-alpine

RUN cat /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/default.conf  /etc/nginx/conf.d/default.conf

COPY --from=frontend /app/dist /usr/share/nginx/html/

# Fetch the ontology into /usr/share/nginx/html/data/ when the container starts. Runs in the
# *background*, so nginx binds immediately and the liveness probe is never at risk; until the file
# lands the app falls back to the source endpoint on its own. Set NEURDF_FETCH_ON_START=0 to skip
# it and always read upstream.
COPY deploy/fetch-neurdf-at-start.sh /docker-entrypoint.d/40-fetch-neurdf.sh
RUN chmod +x /docker-entrypoint.d/40-fetch-neurdf.sh

EXPOSE 80
