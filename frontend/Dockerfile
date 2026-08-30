# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# VITE_API_URL is baked into the JS bundle at build time. these 6 and 7 lines are used to send an api request.
# Default "/api" works with the nginx reverse-proxy config in this image.These 6 and 7 line resolve the database issue when i am entering data through login it is showing error 
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf



CMD ["nginx", "-g", "daemon off;"]
