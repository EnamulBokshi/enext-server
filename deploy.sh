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

# Step 3: Install TypeScript globally to ensure tsc is available in PATH
echo "Installing TypeScript globally..."
npm install -g typescript

# Step 4: Make local TypeScript available
echo "Ensuring local TypeScript is properly linked..."
npm link typescript

# Step 5: Build the project
echo "Building the project..."
npm run build

# Print success message
echo "Build completed successfully!"
echo "Ready for deployment to Vercel!"
echo ""
echo "IMPORTANT: Make sure all environment variables are configured in your Vercel dashboard!"
echo "Required environment variables:"
echo "- PORT"
echo "- NODE_ENV"
echo "- MONGODB_URI"
echo "- RESEND_API_KEY"
echo "- FRONTEND_URL"
echo "- JWT_SECRET"
echo "- JWT_ALGORITHM"
echo "- JWT_EXPIRATION_TIME"
echo "- JWT_ISSUER"
echo "- CLOUDINARY_CLOUD_NAME"
echo "- CLOUDINARY_API_KEY"
echo "- CLOUDINARY_API_SECRET"
echo "- CLOUDINARY_URL"
echo "- GEMINI_API_KEY"
echo "- EMAIL_VERIFY_URL"

# Step 6: Ensure vercel.json exists
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

# Step 7: Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --confirm

echo "Deployment to Vercel completed successfully!"