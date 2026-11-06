#!/bin/bash
set -eo pipefail
# Update system packages
yum update -y

# Install Node.js 26 LTS
yum install -y tar gzip findutils libatomic
export NVM_DIR=/usr/local/nvm
mkdir -p "$NVM_DIR"
NVM_SOURCE=https://raw.githubusercontent.com/nvm-sh/nvm
curl -fsSL "$NVM_SOURCE/v0.40.8/install.sh" \
  | PROFILE=/dev/null bash
. "$NVM_DIR/nvm.sh"
nvm install 26
ln -sf "$(nvm which 26)" /usr/local/bin/node

# Create a simple web application
mkdir -p /home/ec2-user/app
cat > /home/ec2-user/app/server.js << 'EOL'
const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from EC2!\n');
});
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running at http://0.0.0.0:3000/');
});
EOL

# Set permissions
chown -R ec2-user:ec2-user /home/ec2-user/app

# Create a systemd service
cat > /etc/systemd/system/node-app.service << 'EOL'
[Unit]
Description=Node.js Example Server
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/app
ExecStart=/usr/local/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
systemctl enable node-app
systemctl start node-app
