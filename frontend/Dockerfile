# Stage 1: Build the Angular application
FROM node:20 AS build
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/bifrost-lms/browser /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
