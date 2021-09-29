# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.192.0/containers/codespaces-linux/.devcontainer/base.Dockerfile

FROM mcr.microsoft.com/vscode/devcontainers/universal:1-focal

# ** [Optional] Uncomment this section to install additional packages. **
USER root

# Install shellcheck
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install --no-install-recommends shellcheck

# Install Poetry
ENV POETRY_HOME=/opt/poetry
ENV PATH=$PATH:${POETRY_HOME}/bin
RUN curl --retry 3 -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python - \
    && chmod 755 "${POETRY_HOME}/bin/poetry"

USER codespace
