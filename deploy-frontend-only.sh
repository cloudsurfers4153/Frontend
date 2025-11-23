#!/bin/bash

# Frontend Deployment Script for Google Cloud Storage
# Deploys frontend without requiring composite service URL (can be updated later)

set -e

# Configuration
PROJECT_ID="stunning-symbol-479107-j0"
BUCKET_NAME="movie-platform-frontend-479107"

echo "🚀 Deploying Frontend to Google Cloud Storage..."
echo ""

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil not found. Please install Google Cloud SDK"
    exit 1
fi

# Set project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Create bucket if it doesn't exist
echo "🪣 Creating bucket (if needed)..."
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# Configure bucket for static website hosting
echo "⚙️  Configuring bucket for static website hosting..."
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# Make bucket publicly readable
echo "🔓 Making bucket publicly readable..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Upload files
echo "📤 Uploading files to bucket..."
gsutil -m cp index.html *.html *.js *.css gs://$BUCKET_NAME/ 2>/dev/null || true

# Set content types
echo "📄 Setting correct content types..."
gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/*.html
gsutil -m setmeta -h "Content-Type:text/css" gs://$BUCKET_NAME/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" gs://$BUCKET_NAME/*.js

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your website is available at:"
echo "   https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo ""
echo "📝 Next steps:"
echo "   1. Test the website at the URL above"
echo "   2. When your composite service is ready, update app.js with the composite service URL"
echo "   3. Re-upload app.js: gsutil cp app.js gs://$BUCKET_NAME/app.js"

