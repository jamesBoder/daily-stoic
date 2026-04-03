# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments
ARG VITE_API_URL=https://dailystoic-backend.fly.dev

# Set environment variables for build (Vite reads VITE_* vars at build time)
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy nginx config — defaults to nginx.fly.conf for Fly.io production.
# Docker overrides this via docker-compose.yml build arg: NGINX_CONF=nginx.conf
ARG NGINX_CONF=nginx.fly.conf
COPY ${NGINX_CONF} /etc/nginx/nginx.conf

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]