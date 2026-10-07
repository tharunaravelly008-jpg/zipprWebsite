FROM node:18-slim

WORKDIR /app

# Copy package metadata first
COPY package.json .
RUN npm install

# Copy frontend source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite with network access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
