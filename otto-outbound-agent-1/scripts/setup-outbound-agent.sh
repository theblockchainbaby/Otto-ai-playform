#!/bin/bash

# This script sets up the outbound agent environment for the Otto AI project.

echo "Setting up the outbound agent environment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Set up environment variables
echo "Configuring environment variables..."
cp .env.example .env

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the server
echo "Starting the server..."
npm run dev &

echo "Outbound agent setup complete!"