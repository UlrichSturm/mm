#!/bin/bash
# Clean script for Memento Mori

set -e

echo "🧹 Cleaning Memento Mori project..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Remove node_modules
echo -e "${YELLOW}Removing node_modules...${NC}"
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Remove build artifacts
echo -e "${YELLOW}Removing build artifacts...${NC}"
rm -rf apps/*/dist
rm -rf apps/*/.next
rm -rf packages/*/dist

# Remove lock files (optional)
read -p "Remove package-lock.json files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f package-lock.json
    rm -f apps/*/package-lock.json
    rm -f packages/*/package-lock.json
    echo -e "${GREEN}✅ Lock files removed${NC}"
fi

# Remove .env (optional)
read -p "Remove .env file? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f .env
    echo -e "${GREEN}✅ .env removed${NC}"
fi

echo -e "\n${GREEN}🧹 Clean complete!${NC}"
echo -e "Run ${YELLOW}npm install${NC} to reinstall dependencies."
