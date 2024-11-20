.PHONY: build_windows
build_windows:
	wails build -clean -platform windows/amd64

.PHONY: build
build:
	wails build

.PHONY: run
run:
	wails dev