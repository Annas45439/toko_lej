#!/bin/bash
# Startup script for Azure App Service
# Runs Prisma migrate then starts the Next.js app

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Starting Next.js application..."
npm start
