# Multi-stage build for optimized Docker image

# Stage 1: Build React frontend
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy only package files first for better caching
COPY client/package*.json ./

# Install all dependencies (needed for build, including devDependencies)
RUN npm ci --silent && \
    npm cache clean --force

# Copy client source code
COPY client/ ./

# Build React app for production
RUN npm run build && \
    # Remove source files after build
    rm -rf src public node_modules package*.json && \
    # Remove source map files to reduce size
    find build -name "*.map" -delete

# Stage 2: Install server dependencies only
FROM node:18-alpine AS server-deps

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only (excludes devDependencies)
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Stage 3: Final production image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init (lightweight process manager) and clean cache
RUN apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Copy server dependencies from builder
COPY --from=server-deps /app/server/node_modules ./server/node_modules

# Copy only essential server JavaScript files (not package.json or node_modules)
COPY server/*.js ./server/

# Copy built React app (production build only, source files removed)
COPY --from=client-builder /app/client/build ./client/build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server/index.js"]
