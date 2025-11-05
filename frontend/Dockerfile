# 1) Build frontend
FROM node:18 AS build

WORKDIR /app

# Accept build arguments for production URLs
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG VITE_SOCKET_URL

# Set them as environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package.json package-lock.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

# 2) Serve with Nginx
FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
