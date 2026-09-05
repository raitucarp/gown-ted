package main

import (
	"embed"
	"log"

	"github.com/raitucarp/gown-ted/service"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:ui/dist
var assets embed.FS

func main() {
	lexicalService := service.NewLexicalService()

	app := application.New(application.Options{
		Name:        "gown-ted",
		Description: "Intelligent English Text Editor powered by Go WordNet",
		Services: []application.Service{
			application.NewService(lexicalService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Windows: application.WindowsOptions{
			DisableQuitOnLastWindowClosed: false,
		},
	})

	win := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:            "gown-ted — Golang WordNet Text Editor",
		Width:            1400,
		Height:           900,
		Frameless:        true,
		InitialPosition:  application.WindowCentered,
		BackgroundColour: application.NewRGB(24, 26, 32),
		URL:              "/",
		Windows: application.WindowsWindow{
			DisableFramelessWindowDecorations: false,
			NonClientRegionSupport:            true,
		},
	})
	win.Center()
	win.Focus()

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
