#!/bin/sh
set -e

# The default Docker CMD runs `npm start`, which preloads tracing.js.
# Keep command overrides such as `docker run image npm test` working.
exec "$@"
