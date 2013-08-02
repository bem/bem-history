.DEFAULT_GOAL :=

NODE_MODULES := ./node_modules/

ENB := $(NODE_MODULES).bin/enb
NPM := npm

ifneq (,$(findstring B,$(MAKEFLAGS)))
	ENB_FLAGS := --no-cache
endif

all:: $(ENB) server

%:: $(ENB)
	$(if $(findstring GNUmakefile,$@),,$(ENB) make $@ $(ENB_FLAGS))

.PHONY: server
server:: $(ENB)
	echo "Open http://127.0.0.1:8080/desktop.bundles/index/index.html to see build results."
	@$(ENB) server

$(ENB):: $(NODE_MODULES)

$(NODE_MODULES)::
	$(debug ---> Updating npm dependencies)
	@$(NPM) install

install:
	npm install
	git submodule init
	git submodule update

.PHONY: clean
clean::
	$(ENB) make clean
