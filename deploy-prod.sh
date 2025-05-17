#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Create .vercel directory if it doesn't exist
mkdir -p .vercel

# Create or update project.json with protection disabled
echo '{
  "projectId": "prj_your_project_id",
  "orgId": "your_org_id",
  "settings": {
    "framework": null,
    "devCommand": null,
    "installCommand": null,
    "buildCommand": null,
    "outputDirectory": null,
    "rootDirectory": null,
    "directoryListing": false,
    "protection": false
  }
}' > .vercel/project.json

# Deploy to production
echo "Deploying to Vercel production..."
vercel --prod