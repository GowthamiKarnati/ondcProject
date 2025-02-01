#!/bin/bash

# Variables
BUCKET_NAME="ondc-forms-frontend"
LOCAL_DIRECTORY="build/"
AWS_REGION="ap-southeast-1" # e.g., us-east-1

# Check if bucket exists
echo "Checking if S3 bucket '$BUCKET_NAME' exists..."
if aws s3 ls "s3://$BUCKET_NAME" --region $AWS_REGION > /dev/null 2>&1; then
    echo "Bucket '$BUCKET_NAME' exists."
else
    echo "Bucket '$BUCKET_NAME' does not exist. Creating it..."
    aws s3api create-bucket --bucket $BUCKET_NAME --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION
    echo "Bucket '$BUCKET_NAME' created."
fi

# Sync local files to the S3 bucket
echo "Uploading files from '$LOCAL_DIRECTORY' to bucket '$BUCKET_NAME'..."
aws s3 sync $LOCAL_DIRECTORY s3://$BUCKET_NAME --region $AWS_REGION

# Set the S3 bucket for website hosting
echo "Configuring bucket '$BUCKET_NAME' for static website hosting..."
aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document index.html --region $AWS_REGION

# Update bucket policy for static website hosting (Make files publicly readable)
echo "Updating bucket policy for public access..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
        }
    ]
}'

# Output the website URL
echo "Deployment complete. Your website is available at:"
echo "http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

# Done
echo "Website deployment to S3 completed successfully!"
