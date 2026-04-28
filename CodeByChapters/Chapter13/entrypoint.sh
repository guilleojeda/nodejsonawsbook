#!/bin/sh
set -e

# Start the app with OpenTelemetry instrumentation preloaded.
exec node -r ./tracing.js app.js
