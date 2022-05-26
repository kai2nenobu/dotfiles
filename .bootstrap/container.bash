### Bootstrap a container environment like GitHub Codespaces

# Check environment
uname -a
cat /etc/os-release

HERE=$(CDPATH='' cd -- "$(dirname -- "$BASH_SOURCE")" && pwd)
ID_LIKE=$(grep ID_LIKE /etc/os-release | awk -F= '{print $2}')

if [ "$ID_LIKE" != "debian" ]; then
  echo "This script doesn't support distributions other than Debian family." >&2
  return 0
fi

# Install packages
sudo apt update && sudo apt install -y less

. "${HERE}/../configs/.bash_aliases"
install-delta
