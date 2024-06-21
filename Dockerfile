ARG NODE_PARENT=node:18-alpine

FROM  ${NODE_PARENT} as frontend

ENV BUILDDIR=/app

RUN apk add git

WORKDIR ${BUILDDIR}
COPY package.json ${BUILDDIR}
COPY yarn.lock ${BUILDDIR}
COPY nginx/default.conf ${BUILDDIR}

RUN yarn install
COPY . ${BUILDDIR}
# RUN yarn build
EXPOSE 80
CMD ["yarn", "prod"]
