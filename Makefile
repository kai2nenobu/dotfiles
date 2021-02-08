
MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# all targets are phony
.PHONY: $(shell grep -oE ^[a-zA-Z_-]+: $(MAKEFILE_LIST) | sed 's/://')

# Move to the script directory avoid SC1091
# ref. https://github.com/koalaman/shellcheck/issues/1837
lint: ## Lint shell scripts by shellcheck
	@find . -name "*.bash" -or -name "*.sh" | while read -r script; do \
	  ( cd "$$(dirname $$script)"; shellcheck -x "$$(basename $$script)"; ); \
	done

help: ## Print this help
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "    \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
