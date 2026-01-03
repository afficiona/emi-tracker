#!/bin/bash

# Setup script for EMI Tracker encryption

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "EMI Tracker - File Encryption Setup"
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo ""
echo "Enter a password to encrypt your loans data:"
read -s password

if [ -z "$password" ]; then
  echo "Password cannot be empty!"
  exit 1
fi

echo "Confirming password:"
read -s password_confirm

if [ "$password" != "$password_confirm" ]; then
  echo "Passwords do not match!"
  exit 1
fi

echo ""
echo "Encrypting all_loans.json with your password..."
node encrypt-loans.js "$password"

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Setup complete! Your loans data is now encrypted."
  echo ""
  echo "To access your data, you'll need to provide the password when:"
  echo "  - Making API GET requests: /api/loans?password=yourPassword"
  echo "  - Making API PUT requests: /api/loans?password=yourPassword"
fi
