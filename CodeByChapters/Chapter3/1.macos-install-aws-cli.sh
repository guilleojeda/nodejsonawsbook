# Install the current AWS CLI v2 for the current user using AWS's official installer.
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash

# The installer uses XDG_BIN_HOME when set, or ~/.local/bin by default.
export PATH="${XDG_BIN_HOME:-$HOME/.local/bin}:$PATH"
command -v aws
aws --version

# To keep this PATH setting in future terminals, add the export line above
# manually to your shell startup file:
# If you set XDG_BIN_HOME only for this installation, also add that setting
# before the export line, or set PATH to the chosen bin directory directly.
#   zsh: ~/.zshrc
#   Bash: ~/.bashrc, or ~/.bash_profile for a login shell
# Open a new terminal, then run `command -v aws` and `aws --version` to verify it.
