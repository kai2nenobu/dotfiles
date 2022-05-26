### Bootstrap a container environment like GitHub Codespaces

# Check environment
uname -a
cat /etc/os-release

HERE=$(CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
OS_ID=$(grep '^ID=' /etc/os-release | awk -F= '{print $2}')

if [ "$OS_ID" != "debian" ] && [ "$OS_ID" != "ubuntu" ]; then
  echo "This script doesn't support distributions other than Debian family." >&2
  return 0
fi

# Install packages
sudo apt update && sudo apt install -y less

. "${HERE}/../configs/.bash_aliases"
install-delta
