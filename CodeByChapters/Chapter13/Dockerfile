# Use the official Node.js LTS image as the base image.
FROM node:lts

WORKDIR /app

COPY package*.json ./

# Use npm ci when a lockfile is present; fall back to npm install for chapter snippets.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# The book now uses OpenTelemetry/ADOT for new tracing work. Run an ADOT Collector
# sidecar or CloudWatch Agent in ECS and point OTEL_EXPORTER_OTLP_TRACES_ENDPOINT at it.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000

CMD ["npm", "start"]

#build it with this command:
#docker build -t simpleawsnodejsapp .

#run it with this command:
#docker run -p 3000:3000 simpleawsnodejsapp
