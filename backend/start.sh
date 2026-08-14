#!/bin/bash

# Create firebase-service-account.json from environment variable
if [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
  echo "📁 Creating firebase-service-account.json from environment variable..."
  echo "$FIREBASE_SERVICE_ACCOUNT" > firebase-service-account.json
  echo "✅ firebase-service-account.json created successfully"
else
  echo "❌ FIREBASE_SERVICE_ACCOUNT environment variable not found"
  echo "⚠️  Firebase features will not work"
fi

# Start the server
echo "🚀 Starting server..."
node server.js