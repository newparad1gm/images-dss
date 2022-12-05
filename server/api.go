package main

import (
	"encoding/base64"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetObjects(c *gin.Context) {
	bucket := c.Param("bucket")
	log.Printf("Getting objects from bucket %s", bucket)
	objects, err := s3client.GetObjects(bucket)
	if err != nil {
		log.Printf("Error getting from bucket %s", bucket)
		return
	}
	c.JSON(http.StatusCreated, objects)
}

func UploadObject(c *gin.Context) {
	bucket := c.Param("bucket")
	fileHeader, err := c.FormFile("object")
	if err != nil {
		log.Printf("Error getting object")
		return
	}
	log.Printf("Uploading file %s", fileHeader.Filename)
	file, err := fileHeader.Open()
	if err != nil {
		log.Printf("Error opening %s", fileHeader.Filename)
		return
	}
	err = s3client.PutObject(bucket, fileHeader.Filename, fileHeader.Size, file)
	if err != nil {
		log.Printf("Error uploading to %s bucket %s", fileHeader.Filename, bucket)
	}
}

func GetObjectBuffer(bucket string, key string) ([]byte, error) {
	rawObject, err := s3client.GetObject(bucket, key)
	if err != nil {
		log.Printf("Error loading object key %s from bucket %s", key, bucket)
		return nil, err
	}
	obj, err := ioutil.ReadAll(rawObject.Body)
	if err != nil {
		log.Printf("Error reading object key %s from bucket %s", key, bucket)
		return nil, err
	}
	return obj, nil
}

func GetObject(c *gin.Context) {
	bucket := c.Param("bucket")
	key := c.Param("key")
	obj, err := GetObjectBuffer(bucket, key)
	if err != nil {
		log.Printf("Error reading object key %s from bucket %s", key, bucket)
		return
	}
	c.JSON(http.StatusCreated, obj)
}

func LoadImage(c *gin.Context) {
	bucket := c.Param("bucket")
	imageName := c.Param("image")
	img, err := GetObjectBuffer(bucket, imageName)
	if err != nil {
		log.Printf("Error reading object key %s from bucket %s", imageName, bucket)
		return
	}
	encoded := base64.StdEncoding.EncodeToString(img)
	c.HTML(http.StatusOK, "image.tmpl", gin.H{
		"title": imageName,
		"image": encoded,
	})
}

func SetupRouter(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/objects/:bucket", GetObjects)
		api.POST("/upload/:bucket", UploadObject)
		api.GET("/get/:bucket/:key", GetObject)
		api.GET("/load/:bucket/:image", LoadImage)
	}
}
