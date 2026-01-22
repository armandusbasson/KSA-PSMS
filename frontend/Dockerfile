FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for build)
RUN npm install --include=dev

# Copy application code
COPY . .

# Accept build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the development server (listen on all interfaces)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
