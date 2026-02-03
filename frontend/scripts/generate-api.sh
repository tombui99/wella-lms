#!/bin/bash

# Configuration
API_URL="http://localhost:5000/openapi/v1.json"
OUTPUT_DIR="src/app/api"

echo "Generating API services from $API_URL..."

# Check if openapi-generator-cli is installed
if ! npx openapi-generator-cli version > /dev/null 2>&1; then
    echo "Error: openapi-generator-cli is not installed. Run 'npm install' first."
    exit 1
fi

# Generate code
npx openapi-generator-cli generate \
    -i $API_URL \
    -g typescript-angular \
    -o $OUTPUT_DIR \
    --skip-validate-spec \
    --additional-properties=providedInRoot=true

echo "Done! Generated files are in $OUTPUT_DIR"
