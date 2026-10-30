# Install Node.js 26 LTS, the current LTS release used in this book, using
# the method documented on the Node.js download page.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install 26
node --version
npm --version
