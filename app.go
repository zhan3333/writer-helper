package main

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"net/url"
	"os"
	"strings"
	"writer-helper/internal/service"
)

// App struct
type App struct {
	ctx             context.Context
	downloadService *service.DownloadService
	ruiwenService   *service.RuiWenDownloadService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		downloadService: service.NewDownloadService(),
		ruiwenService:   service.NewRuiWenDownloadService(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetDefaultSaveDirectory() string {
	dir, err := os.Getwd()
	if err != nil {
		runtime.LogErrorf(a.ctx, "Failed to get current directory: %s", err.Error())
	}
	return dir
}

func (a *App) SelectSaveDirectory() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		runtime.LogErrorf(a.ctx, "Failed to get current directory: %s", err.Error())
	}
	selectedDir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory:     dir,
		Title:                "选择保存文件夹",
		CanCreateDirectories: true,
	})

	if err != nil {
		runtime.LogErrorf(a.ctx, "Failed to select directory: %s", err.Error())
	}
	return selectedDir, err
}

func (a *App) DownloadUrl(videoUrl string, savePath string) (string, error) {
	_, err := url.Parse(videoUrl)
	if err != nil {
		return "", fmt.Errorf("invalid url: %s", videoUrl)
	}

	if out, err := a.downloadService.Download(a.ctx, videoUrl, savePath); err != nil {
		return "", fmt.Errorf("download failed: %w", err)
	} else {
		return out, nil
	}
}

func (a *App) DownloadRuiWenUrl(link string) (string, error) {
	u, err := url.Parse(link)
	if err != nil {
		return "", fmt.Errorf("invalid url: %s", link)

	}

	if !strings.Contains(u.Host, "ruiwen.com") {
		return "", fmt.Errorf("只支持 https://*.ruiwen.com, 但是传入了: %s", link)
	}

	if out, err := a.ruiwenService.Download(a.ctx, link); err != nil {
		return "", fmt.Errorf("download failed: %w", err)
	} else {
		return out, nil
	}
}

func (a *App) GetDownloadOutput() string {
	return a.downloadService.GetDownloadOutput()
}

func (a *App) GetFfmpegPath() string {
	return a.downloadService.GetFfmpegPath()
}
