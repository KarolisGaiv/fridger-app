# Stage 1: Build our front end
FROM node:20.14.0-alpine3.20 AS builder

WORKDIR /app

# Copy package.json files and install dependencies
COPY ../package*.json .
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm ci

COPY . .

# Switch to the client folder
WORKDIR /app/client

# Build the client (HTML, CSS, JS, ...)
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.27.0-alpine3.19 as nginx

# Delete the default welcome page.
RUN rm /usr/share/nginx/html/* -rf

# Copy the built client app assets to the Nginx directory
COPY --from=builder /app/client/dist /usr/share/nginx/html

ENV NGINX_ENVSUBST_OUTPUT_DIR '/etc/nginx/conf.d'

# Copy the Nginx configuration
COPY client/nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx.
CMD ["nginx", "-g", "daemon off;"]
