# 1) Build frontend
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

# 2) Serve with Nginx
FROM nginx:1.25-alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=build /app/dist .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
