#!/bin/bash
# Reset Docker containers and volumes

set -e

echo "🐳 Resetting Docker environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}⚠️  WARNING: This will remove all Docker containers, volumes, and data!${NC}"
read -p "Are you sure? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Stop containers
echo -e "\n${YELLOW}Stopping containers...${NC}"
docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
docker-compose down -v 2>/dev/null || true

# Remove orphan containers
echo -e "${YELLOW}Removing orphan containers...${NC}"
docker container prune -f

# Remove volumes
echo -e "${YELLOW}Removing volumes...${NC}"
docker volume prune -f

echo -e "\n${GREEN}🐳 Docker reset complete!${NC}"
echo -e "Run ${YELLOW}docker-compose -f docker-compose.dev.yml up -d${NC} to start fresh."
