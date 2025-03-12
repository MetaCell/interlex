FROM node:18

WORKDIR /app
COPY package.json package.json ./
RUN npm install
COPY . .

ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]