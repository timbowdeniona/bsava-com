#!/usr/bin/env bash

# ==============================================================================
# BSAVA MACH Architecture - Local Environment Setup Script
# ==============================================================================
# This script automates the initial setup of the local development environment.
# It checks for required tools, sets up environment variables, and installs
# application dependencies.
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status
set -o pipefail # Return value of a pipeline is the status of the last command to exit with a non-zero status

# Text colors for output
RED='\032[0;31m'
GREEN='\032[0;32m'
YELLOW='\032[1;33m'
BLUE='\032[0;34m'
NC='\032[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}          BSAVA Website Migration - Dev Env Setup               ${NC}"
echo -e "${BLUE}================================================================${NC}\n"

# ------------------------------------------------------------------------------
# 1. System Requirements Check
# ------------------------------------------------------------------------------
echo -e "${YELLOW}Step 1: Checking system requirements...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js (v18+ recommended).${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js installed ($NODE_VERSION)${NC}"

# Check for npm (or yarn/pnpm depending on project preference)
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install npm.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm installed ($NPM_VERSION)${NC}"

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ git installed${NC}"

echo -e "\n"

# ------------------------------------------------------------------------------
# 2. Environment Variables Setup
# ------------------------------------------------------------------------------
echo -e "${YELLOW}Step 2: Setting up environment variables...${NC}"

if [ -f .env.local ]; then
    echo -e "${GREEN}✓ .env.local already exists. Skipping copy.${NC}"
else
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Copied .env.example to .env.local${NC}"
        echo -e "${RED}ACTION REQUIRED: Please remember to fill in the actual secret values in .env.local!${NC}"
        echo -e "${YELLOW}Ask the project lead or check 1Password/Vault for credentials.${NC}"
    else
        echo -e "${RED}Error: .env.example file not found. Please ensure it exists in the repository root.${NC}"
        exit 1
    fi
fi

echo -e "\n"

# ------------------------------------------------------------------------------
# 3. Installing Dependencies
# ------------------------------------------------------------------------------
echo -e "${YELLOW}Step 3: Installing project dependencies...${NC}"

if [ -f package.json ]; then
    echo "Running npm install..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"
else
    echo -e "${YELLOW}Notice: No package.json found in the current directory. Skipping dependency installation.${NC}"
fi

echo -e "\n"

# ------------------------------------------------------------------------------
# 4. Completion
# ------------------------------------------------------------------------------
echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}================================================================${NC}"
echo -e "Next steps:"
echo -e "1. Update your ${YELLOW}.env.local${NC} file with the real API keys and tokens."
echo -e "2. Run ${GREEN}npm run dev${NC} to start the local development server."
echo -e "3. Read the README.md for more detailed architectural information."
echo ""
