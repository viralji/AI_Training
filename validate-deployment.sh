#!/bin/bash

# Deployment Validation Script
# Run this before deploying to production to catch issues early

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔍 Validating Deployment Configuration...${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check required environment variables
REQUIRED_VARS=(
    "PORT"
    "JWT_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "GEMINI_API_KEY"
    "FRONTEND_URL"
)

echo ""
echo "Checking required environment variables..."
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
        value=$(grep "^${var}=" .env | cut -d '=' -f2-)
        if [ -z "$value" ] || [ "$value" = "" ]; then
            echo -e "${RED}❌ ${var} is empty${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅ ${var} is set${NC}"
        fi
    else
        echo -e "${RED}❌ ${var} not found in .env${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check JWT_SECRET is not default
if grep -q "JWT_SECRET=dev_secret_key_change_in_production" .env 2>/dev/null; then
    echo -e "${RED}❌ JWT_SECRET is still using default value${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if PROD environment file exists and is configured
echo ""
echo "Checking production environment configuration..."
if [ -f docker/.env.prod ]; then
    if grep -q "^FRONTEND_URL=https://" docker/.env.prod 2>/dev/null; then
        PROD_URL=$(grep "^FRONTEND_URL=" docker/.env.prod | cut -d '=' -f2-)
        echo -e "${GREEN}✅ Production environment file configured${NC}"
        echo -e "${GREEN}   FRONTEND_URL: $PROD_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  docker/.env.prod exists but FRONTEND_URL doesn't start with https://${NC}"
        echo -e "${YELLOW}   Please update docker/.env.prod with your production domain${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  docker/.env.prod not found${NC}"
    echo -e "${YELLOW}   Copy from docker/.env.prod.example and update with production values${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check database path consistency
echo ""
echo "Checking database configuration..."
DB_PATH=$(grep "^DATABASE_PATH=" .env 2>/dev/null | cut -d '=' -f2- || echo "")
# Note: Docker compose will override this with /app/database.sqlite, so local value is OK
if [ -n "$DB_PATH" ]; then
    echo -e "${GREEN}✅ DATABASE_PATH is set (Docker will use /app/database.sqlite)${NC}"
fi

# Check Docker files exist
echo ""
echo "Checking Docker configuration..."
if [ ! -f backend/Dockerfile ]; then
    echo -e "${RED}❌ backend/Dockerfile not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ backend/Dockerfile exists${NC}"
fi

if [ ! -f frontend/Dockerfile ]; then
    echo -e "${RED}❌ frontend/Dockerfile not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ frontend/Dockerfile exists${NC}"
fi

if [ ! -f docker/docker-compose.prod.yml ]; then
    echo -e "${RED}❌ docker/docker-compose.prod.yml not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ docker/docker-compose.prod.yml exists${NC}"
fi

# Check database file exists and is writable
echo ""
echo "Checking database file..."
if [ ! -f backend/database.sqlite ]; then
    echo -e "${YELLOW}⚠️  backend/database.sqlite not found (will be created on first run)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    if [ -w backend/database.sqlite ]; then
        echo -e "${GREEN}✅ backend/database.sqlite exists and is writable${NC}"
    else
        echo -e "${RED}❌ backend/database.sqlite exists but is not writable${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check uploads directory
echo ""
echo "Checking uploads directory..."
if [ ! -d backend/uploads ]; then
    echo -e "${YELLOW}⚠️  backend/uploads directory not found (will be created)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    if [ -w backend/uploads ]; then
        echo -e "${GREEN}✅ backend/uploads exists and is writable${NC}"
    else
        echo -e "${RED}❌ backend/uploads exists but is not writable${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check if code has auto-seeding
echo ""
echo "Checking code configuration..."
if grep -q "Auto-seed assignments" backend/src/db/database.js 2>/dev/null; then
    echo -e "${GREEN}✅ Auto-seeding is enabled in database.js${NC}"
else
    echo -e "${RED}❌ Auto-seeding not found in database.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "DATABASE_PATH" backend/src/db/database.js 2>/dev/null; then
    echo -e "${GREEN}✅ DATABASE_PATH environment variable is used${NC}"
else
    echo -e "${RED}❌ DATABASE_PATH not used in database.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check scoring queue
if grep -q "return queuePromise" backend/src/services/scoringQueue.js 2>/dev/null; then
    echo -e "${GREEN}✅ Scoring queue returns promise correctly${NC}"
else
    echo -e "${RED}❌ Scoring queue may not return promise correctly${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Validation passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Ready for deployment!"
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS error(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Please fix the errors before deploying!"
    exit 1
fi

