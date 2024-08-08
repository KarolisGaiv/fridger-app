FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

# copy over the server source code
COPY server/ server/

# build the server
WORKDIR /app/server
RUN npm run build

EXPOSE 3000

# commands docker runs when it starts the container
CMD ["npm", "run", "prod"]
