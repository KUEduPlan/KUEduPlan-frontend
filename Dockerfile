# Build Stage
FROM node:16-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build the frontend
COPY . .
RUN npm run build

# Serve the app using serve
FROM node:16-alpine AS production
WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy the build output from the build stage
COPY --from=build /app/build /app/build

# Expose port 3000 (default for serve)
EXPOSE 3000

# Start serving the frontend
CMD ["serve", "-s", "dist", "-l", "3000"]