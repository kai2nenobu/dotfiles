
MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# all targets are phony
.PHONY: $(shell grep -oE ^[a-zA-Z_-]+: $(MAKEFILE_LIST) | sed 's/://')

lint-shellcheck: ## Lint shell scripts by shellcheck
	@find . -name "*.bash" -or -name "*.sh" -or -name "pre-commit" | xargs shellcheck -e SC1091

lint-ansible: ## Lint ansible playbooks by ansible-lint
	@cd ansible; poetry run ansible-lint site.yml

lint-yaml: ## Lint yaml format by yamllint
	@cd ansible; poetry run yamllint -f github .

lint: lint-shellcheck lint-ansible lint-yaml ## Lint whole files

help: ## Print this help
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "    \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
