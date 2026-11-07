# Use the official Node.js image as the base image
FROM node:26-bookworm-slim

# Create app directory and set ownership
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Create the non-root user before copying app source
RUN useradd -m nodeuser

COPY --chown=nodeuser:nodeuser . .
# Switch to the non-root user for runtime
USER nodeuser

# Do not expose internal parser details in production responses.
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Define health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http') \
    .get('http://localhost:' + (process.env.PORT || \
      3000) + '/health', res => process.exit( \
        res.statusCode === 200 ? 0 : 1)) \
    .on('error', () => process.exit(1))"

# Start the app
CMD [ "npm", "start" ]
