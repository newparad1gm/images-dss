package main

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
)

func LogAndSetError(c *gin.Context, err error, errorStr string) {
	log.Println(errorStr)
	log.Println(err)
	c.JSON(http.StatusBadGateway, gin.H{"error": errorStr})
}

func GetObjects(c *gin.Context) {
	bucket := c.Param("bucket")
	log.Printf("Getting objects from bucket %s", bucket)
	objects, err := s3client.GetObjects(bucket)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error getting from bucket %s", bucket))
		return
	}
	c.JSON(http.StatusCreated, objects)
}

func UploadObject(c *gin.Context) {
	bucket := c.Param("bucket")
	fileHeader, err := c.FormFile("object")
	if err != nil {
		LogAndSetError(c, err, "Error getting object from form")
		return
	}
	key := c.PostForm("key")
	log.Printf("Uploading file %s", key)
	file, err := fileHeader.Open()
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error opening %s", key))
		return
	}
	err = s3client.PutObject(bucket, key, fileHeader.Size, file)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error uploading to %s bucket %s", key, bucket))
		return
	}
	c.JSON(http.StatusOK, gin.H{"uploaded": key})
}

func GetObjectFromS3(bucket string, key string) (*s3.GetObjectOutput, error) {
	rawObject, err := s3client.GetObject(bucket, key)
	if err != nil {
		log.Printf("Error loading object key %s from bucket %s", key, bucket)
		return nil, err
	}
	return rawObject, nil
}

func GetObjectBuffer(obj *s3.GetObjectOutput) ([]byte, error) {
	bytes, err := ioutil.ReadAll(obj.Body)
	if err != nil {
		log.Println("Error getting object buffer")
		return nil, err
	}
	return bytes, nil
}

func GetObject(c *gin.Context) {
	bucket := c.Param("bucket")
	key := c.Param("key")
	obj, err := GetObjectFromS3(bucket, key)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error reading object key %s from bucket %s", key, bucket))
		return
	}
	bytes, err := GetObjectBuffer(obj)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error getting object buffer from %s", key))
		return
	}
	c.JSON(http.StatusCreated, gin.H{"buffer": bytes, "contentType": obj.ContentType})
}

func LoadImage(c *gin.Context) {
	bucket := c.Param("bucket")
	imageName := c.Param("image")
	obj, err := GetObjectFromS3(bucket, imageName)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error reading object key %s from bucket %s", imageName, bucket))
		return
	}
	img, err := GetObjectBuffer(obj)
	if err != nil {
		LogAndSetError(c, err, fmt.Sprintf("Error getting object buffer from %s", imageName))
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
	}
}
