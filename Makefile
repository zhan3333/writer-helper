.PHONY: build_windows
build_windows:
	wails build -clean -platform windows/amd64
    # rename format to write-helper-{date}.exe
	mv build/bin/writer-helper.exe build/bin/writer-helper-$(shell date +%Y-%m-%d).exe


.PHONY: compress
compress:
	zip -j build/writer-helper-windows-amd64.zip build/bin/writer-helper.exe build/ffmpeg/ffmpeg.exe README.txt

.PHONY: build
build:
	wails build

.PHONY: run
run:
	wails dev

.PHONY: run_server
run_server:
	cd server && go run main.go