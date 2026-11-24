#!/bin/bash

# Create firebase-service-account.json from secret
if [ -n "$FIREBASE_SERVICE_ACCOUNT_FILE" ]; then
  echo "$FIREBASE_SERVICE_ACCOUNT_FILE" > firebase-service-account.json
  echo "✅ firebase-service-account.json created from secret"
elif [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
  echo "$FIREBASE_SERVICE_ACCOUNT" > firebase-service-account.json
  echo "✅ firebase-service-account.json created from environment variable"
else
  echo "❌ No Firebase service account found"
fi

# Start the server
node server.js