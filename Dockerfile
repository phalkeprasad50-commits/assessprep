# Stage 1: build the static site
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve it with nginx (non-root image variant)
FROM nginxinc/nginx-unprivileged:1.27-alpine
ENV API_UPSTREAM=http://host.docker.internal:8080
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
