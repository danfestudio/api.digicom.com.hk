# Use Node.js as the base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Ensure caniuse-lite is up to date
RUN npx update-browserslist-db@latest

# Build the application
RUN npm run build

# Use a minimal Node.js environment to serve the application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY --from=build /app/package.json /app/package.json
RUN npm install --only=production

# Copy the built files from the previous stage
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public

# Set environment to production
ENV NODE_ENV=production

# Expose port 8888
EXPOSE 8888

# Start the Next.js app
CMD ["npm", "run", "start"]
