#!/bin/sh

### Create a virtualenv to run ansible playbook by poetry and
### archive it to share created virtualenv.

set -eu

cwd="$PWD"

## Install prerequisites
apt update && apt install -y ca-certificates curl python3 python3-dev python3-distutils build-essential libffi-dev

## Install poetry
export POETRY_HOME=/opt/poetry
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python3 -

# shellcheck disable=SC1090
. "${POETRY_HOME}/env"

## Install dependent packages into venv
cd ansible
poetry env use /usr/bin/python3
poetry install --no-dev

## Move venv into a fixed location
TARGET_LOCATION=/opt/ansible-venv
venv_location=$(poetry env info -p)
mv "$venv_location" "$TARGET_LOCATION"

## Archive the venv
. "/etc/os-release"
cd "$TARGET_LOCATION"
find . -name "*.pyc" -print0 | xargs -0 --no-run-if-empty -- rm
grep "$venv_location" -RIl | xargs --no-run-if-empty -- sed -i "s@${venv_location}@${TARGET_LOCATION}@g"
tar zcf "${cwd}/${ID}-${VERSION_ID}-ansible-venv.tar.gz" .
