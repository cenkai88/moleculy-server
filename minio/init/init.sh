#!/bin/sh

# Wait for MinIO server to be healthy
until curl -sSf http://localhost:9000/minio/health/live; do
  echo 'Waiting for MinIO server to be ready...'
  sleep 5
done

# Configure MinIO client (mc)
mc alias set minio http://localhost:9000 ingsh $MINIO_ROOT_PASSWORD

# Create buckets
mc mb minio/mol-file-athena-lambda-prod-favorite
mc mb minio/mol-file-athena-lambda-prod-normal
mc mb minio/mol-user-team-s3-prod-favorite
mc mb minio/mol-user-team-s3-prod-normal
mc mb minio/mol-paper-s3-prod
mc mb minio/app-3-prod
mc mb minio/mol-thumbnail-prod
mc mb minio/mol-file-main-s3-prod-agent
mc mb minio/mol-file-athena-s3-prod-result

# Set up webhooks
mc admin config set minio notify_webhook:1 endpoint=https://$MINIO_WEBHOOK_DOMAIN/file/minio_webhook queue_limit=0 queue_dir=""

# bucket event to trigger webhook
mc event add minio/mol-file-athena-lambda-prod-favorite arn:minio:sqs::1:webhook --event put,delete
mc event add minio/mol-file-athena-lambda-prod-normal arn:minio:sqs::1:webhook --event put,delete
mc event add minio/mol-user-team-s3-prod-favorite arn:minio:sqs::1:webhook --event put,delete
mc event add minio/mol-user-team-s3-prod-normal arn:minio:sqs::1:webhook --event put,delete
mc event add minio/mol-paper-s3-prod arn:minio:sqs::1:webhook --event put
mc event add minio/app-3-prod arn:minio:sqs::1:webhook --event put

mc admin service restart minio