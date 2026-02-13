# Use Node 24 to match your local environment
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package files first (optimized caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose Vite's port
EXPOSE 5173

# Start Vite and force it to listen on all network interfaces
# This is required for Docker to map the port to your browser
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]