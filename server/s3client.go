package main

import (
	"context"
	"log"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Client struct {
	Client *s3.Client
}

func CustomResolver(envRegion string, awsEndpoint string) aws.EndpointResolverWithOptionsFunc {
	return aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		if service == s3.ServiceID && region == envRegion {
			return aws.Endpoint{
				PartitionID:   "aws",
				URL:           awsEndpoint,
				SigningRegion: envRegion,
			}, nil
		}
		// returning EndpointNotFoundError will allow the service to fallback to it's default resolution
		return aws.Endpoint{}, &aws.EndpointNotFoundError{}
	})
}

func (s S3Client) GetObjects(bucket string) ([]types.Object, error) {
	output, err := s.Client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	return output.Contents, nil
	/*var objects []string
	for _, object := range output.Contents {
		objects = append(objects, aws.ToString(object.Key))
	}
	return objects, nil*/
}

func (s S3Client) PutObject(bucket string, fileName string, fileSize int64, file multipart.File) error {
	_, err := s.Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(bucket),
		Key:           aws.String(fileName),
		Body:          file,
		ContentLength: fileSize,
	})
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}

func (s S3Client) GetObject(bucket string, key string) (*s3.GetObjectOutput, error) {
	object, err := s.Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	return object, nil
}

func CreateS3Client(accessKey string, secretAccess string, envRegion string, awsEndpoint string) (*S3Client, error) {
	staticProvider := credentials.NewStaticCredentialsProvider(
		accessKey,
		secretAccess,
		"",
	)

	customResolver := CustomResolver(envRegion, awsEndpoint)
	cfg, err := config.LoadDefaultConfig(
		context.Background(),
		config.WithRegion(envRegion),
		config.WithCredentialsProvider(staticProvider),
		config.WithEndpointResolverWithOptions(customResolver),
	)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}

	// Create an Amazon S3 service client with path style as that is what OORT uses
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})
	s3Client := new(S3Client)
	s3Client.Client = client
	return s3Client, nil
}
