# Install Node.js 24 LTS using the method documented on the Node.js download page.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install 24
node --version
npm --version
