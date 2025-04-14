#!/bin/bash
# Script to deploy Docker container to Azure Container Instances

# Variables
RESOURCE_GROUP="ktpm-react-rg"
LOCATION="eastus"
CONTAINER_NAME="ktpm-react-container"
DNS_NAME_LABEL="ktpm-react-app" # Change this to a unique value
IMAGE="ghcr.io/ducchinhpro123/ktpm-react:latest" # Update with your image name
REGISTRY_SERVER="ghcr.io"
USERNAME="$GITHUB_USERNAME" # Replace with your GitHub username when running
PASSWORD="$GITHUB_TOKEN" # Replace with your GitHub PAT when running

# Create resource group if it doesn't exist
echo "Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy container instance
echo "Creating container instance..."
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $IMAGE \
  --dns-name-label $DNS_NAME_LABEL \
  --ports 80 \
  --registry-username $USERNAME \
  --registry-password $PASSWORD \
  --registry-login-server $REGISTRY_SERVER \
  --cpu 1 \
  --memory 1.5

# Get container FQDN
echo "Getting container URL..."
az container show \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --query ipAddress.fqdn \
  --output tsv

echo "Deployment complete. Your application should be available at http://$DNS_NAME_LABEL.$LOCATION.azurecontainer.io"