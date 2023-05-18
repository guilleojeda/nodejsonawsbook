#!/bin/sh

# Start the X-Ray daemon in the background
/usr/local/bin/xray -t 0.0.0.0:2000 -b 0.0.0.0:2000 &

# Start your app
node app.js