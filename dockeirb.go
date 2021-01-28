package main

import (
	"github.com/astaxie/beego"
	_ "docker-ui/routers"
)

/* The main function of beego application */
func main() {
	// Build the binary to run web server
	beego.Run()
}
