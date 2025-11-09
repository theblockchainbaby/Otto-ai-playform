#!/bin/bash

# This script is for testing outbound calls using the Otto AI outbound agent.

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Function to initiate a test outbound call
function test_outbound_call() {
  local phone_number="$1"
  
  if [ -z "$phone_number" ]; then
    echo "Usage: $0 <phone_number>"
    exit 1
  fi

  echo "Initiating outbound call to $phone_number..."

  # Call the outbound API endpoint to initiate the call
  response=$(curl -s -X POST "http://localhost:3000/api/outbound/calls" \
    -H "Content-Type: application/json" \
    -d "{\"to\": \"$phone_number\"}")

  echo "Response from outbound call API: $response"
}

# Check if a phone number was provided as an argument
if [ $# -eq 0 ]; then
  echo "No phone number provided. Please provide a phone number to test."
  exit 1
fi

# Initiate the test outbound call
test_outbound_call "$1"