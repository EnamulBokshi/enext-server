#!/bin/bash

# filepath: enext-server/deploy-vercel.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting automated deployment to Vercel..."

# Step 1: Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Installing Vercel CLI globally..."
  npm install -g vercel
fi

# Step 2: Install project dependencies
echo "Installing project dependencies..."
npm install

# Step 3: Ensure TypeScript is installed
echo "Ensuring TypeScript is installed..."
npm install typescript --save

# Step 4: Build the project
echo "Building the project..."
npm run build

# Step 5: Ensure vercel.json exists
if [ ! -f vercel.json ]; then
  echo "Creating vercel.json configuration file..."
  cat <<EOL > vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/app.js"
    }
  ]
}
EOL
fi

# Step 6: Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --confirm

echo "Deployment to Vercel completed successfully!"