# Use the official Node.js 24 LTS image as the base image.
FROM node:24-bookworm-slim

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

EXPOSE 3000

CMD ["npm", "start"]

#build it with this command:
#docker build -t simpleawsnodejsapp .

#run it with this command:
#docker run -p 3000:3000 simpleawsnodejsapp
