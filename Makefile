.PHONY: build_windows
build_windows:
	wails build -clean -debug -platform windows/amd64

.PHONY: build
build:
	wails build

.PHONY: run
run:
	wails dev

.PHONY: run_server
run_server:
	cd server && go run main.go