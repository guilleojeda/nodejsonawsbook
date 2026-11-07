# Use the official Node.js 26 LTS image as the base image.
FROM node:26-bookworm-slim

WORKDIR /app

COPY package*.json ./

# Install the dependencies from the committed lockfile.
RUN npm ci && npm cache clean --force

# Copy application files and the downloaded public CA bundle with non-root ownership.
COPY --chown=node:node . .
RUN test -s certs/global-bundle.pem || { \
  echo "Download the RDS CA bundle to certs/global-bundle.pem before building." >&2; \
  exit 1; \
}
USER node

# Do not expose internal parser details in production responses.
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "-r", "./tracing.js", "app.js"]

#build it with this command:
#docker build -t simpleawsnodejsapp .

#run it with this command:
#docker run -p 127.0.0.1:3000:3000 simpleawsnodejsapp
