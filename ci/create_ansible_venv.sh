#!/bin/bash

### Create a virtualenv to run ansible playbook by poetry and
### archive it to share created virtualenv.

set -eu

root_dir="$PWD"

## Install prerequisites
apt update && apt install -y ca-certificates curl python3 python3-pip \
  python3-venv python3-wheel python3-dev python3-distutils build-essential libffi-dev

## Install poetry
export POETRY_HOME=/opt/poetry
curl -sSL https://install.python-poetry.org | python3 -

## Install dependent packages into venv
TARGET_LOCATION=/opt/ansible-venv
python3 -m venv "$TARGET_LOCATION"
. "$TARGET_LOCATION/bin/activate"
cd ansible
pip3 install wheel && pip3 install -r <(/opt/poetry/bin/poetry export -f requirements.txt)

## Archive the venv
. "/etc/os-release"
cd "$root_dir"
find "$TARGET_LOCATION" -name "*.pyc" -print0 | xargs -0 --no-run-if-empty -- rm
tar zcf "${ID}-${VERSION_ID}-ansible-venv.tar.gz" -C "$TARGET_LOCATION" .
