# Josh Hoy's Personal Blog Rest Api

## Description

This projects intention was a way to put in play concepts and tech that I wanted to gain more exposure to. It is still a work in progress and is changing freqently... when I find the time.

It is a blog rest api built with Node.js, Express, using Typescript; stores data in PostgreSQL using TypeORM and Aws S3; allows oauth authentication with GitHub; and ensures authentication with JWT tokens. It is then built into a docker images, pushed toAws ECR, and hosted in Elastic Beanstalk using Aws Route 53 to ensure domains are pointed where they need to be. It also has an email serivce that uses Nodemailer that uses Aws SES to allow for a contact page.

## Steps to run this project:

```
1. Run `npm install` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command
4. typeorm migration:create -n CreateAdminUser
5. npm run migration:run
```

## Docker Build / Run / Delete / List

```
1. docker build -t blog-api .
2. docker run -p 80:80 blog-api
3. docker system prune -a -> to delete all images.
4. docker images
```

## Create / Delete Docker Repository on AWS ECR

```
1. aws ecr create-repository --repository-name blog-api --image-scanning-configuration scanOnPush=true --region us-east-1
2. aws ecr delete-repository --repository-name blog-api --force
```

## Deploy Docker Image to AWS ECR

```
1. aws ecr get-login --no-include-email --region us-east-1
2. docker login -u AWS -p ....
3. docker tag blog-api:latest #########.dkr.ecr.us-east-1.amazonaws.com/blog-api:latest
4. docker push #########.dkr.ecr.us-east-1.amazonaws.com/blog-api:latest
5. aws ecr describe-repositories
6. aws ecr describe-images --repository-name blog-api
```

## Aws docker commands

```
1. aws ecr list-images --repository-name blog-api
2. aws ecr batch-delete-image --repository-name blog-api --image-ids imageTag=latest
```
