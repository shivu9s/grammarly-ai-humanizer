# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run validation checks and type checking
RUN npm run typecheck

# Build the Astro production site
RUN npm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Install only production dependencies to keep the image slim
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy only the compiled build files from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the server port
EXPOSE 4321

# Start the Node.js standalone server
CMD ["node", "dist/server/entry.mjs"]
