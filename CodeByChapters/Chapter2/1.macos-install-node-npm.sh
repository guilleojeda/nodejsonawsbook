# Install Node.js 26 LTS, the current LTS release used in this book, using
# the method documented on the Node.js download page.
# Match nvm's install directory so this shell loads the files it just installed.
if [ -z "${NVM_DIR:-}" ]; then
  if [ -n "${XDG_CONFIG_HOME:-}" ]; then
    NVM_DIR="${XDG_CONFIG_HOME}/nvm"
  else
    NVM_DIR="${HOME}/.nvm"
  fi
fi
export NVM_DIR
# Create the selected directory; --no-use leaves Node 26 selection to the next step.
mkdir -p "$NVM_DIR" &&
(
  set -o pipefail
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
) &&
. "$NVM_DIR/nvm.sh" --no-use &&
nvm install 26 &&
node --version &&
npm --version
