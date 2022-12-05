package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

var s3client *S3Client

func main() {
	accessKey := os.Getenv("ACCESS_KEY")
	secretAccess := os.Getenv("SECRET_ACCESS_KEY")
	envRegion := os.Getenv("REGION")
	awsEndpoint := os.Getenv("AWS_ENDPOINT")
	var err error
	s3client, err = CreateS3Client(accessKey, secretAccess, envRegion, awsEndpoint)
	if err != nil {
		log.Fatal(err)
	}

	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.Use(cors.Default())
	router.Use(static.Serve("/", static.LocalFile("./views", true)))
	SetupRouter(router)
	router.Run()
}
