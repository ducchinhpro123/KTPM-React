#!/bin/bash
# Script to deploy Docker container to Azure Container Instances

# Variables
RESOURCE_GROUP="ktpm-react-rg"
LOCATION="eastus"
CONTAINER_NAME="ktpm-react-container"
DNS_NAME_LABEL="ktpm-react-app" # Change this to a unique value
IMAGE="ghcr.io/ducchinhpro123/ktpm-react:latest" # Update with your image name
REGISTRY_SERVER="ghcr.io"

# Registry credentials: can pass as args or via env vars GITHUB_USERNAME and GITHUB_TOKEN
USERNAME="${1:-$GITHUB_USERNAME}"
PASSWORD="${2:-$GITHUB_TOKEN}"

# Ensure credentials are provided
if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
  echo "Error: Registry credentials not provided."
  echo "Usage: $0 <registry-username> <registry-password> or set GITHUB_USERNAME and GITHUB_TOKEN env vars"
  exit 1
fi

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
  --os-type Linux \
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