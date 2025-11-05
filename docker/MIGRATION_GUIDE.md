# Migration Guide - Old to New Structure

## What Changed

### Before:
```
AI_Training/
├── docker-compose.local.yml    (root)
├── docker-compose.prod.yml     (root)
├── .env                        (root)
└── ...
```

### After:
```
AI_Training/
├── docker/
│   ├── docker-compose.local.yml
│   ├── docker-compose.prod.yml
│   ├── .env.local
│   └── .env.prod
└── ...
```

## Migration Steps

### 1. Update Your Commands

**Old:**
```bash
docker-compose -f docker-compose.local.yml up -d
```

**New:**
```bash
cd docker
docker-compose -f docker-compose.local.yml up -d
```

Or use the convenience scripts:
```bash
cd docker
./start-local.sh    # For local
./start-prod.sh     # For production
```

### 2. Environment Variables

**Old:** Single `.env` file with switch-env.sh

**New:** Separate files:
- `docker/.env.local` - Local development
- `docker/.env.prod` - Production

**Migration:**
```bash
# Copy your local settings
cp .env docker/.env.local
# Edit docker/.env.local with local values

# Copy your production settings
cp .env docker/.env.prod
# Edit docker/.env.prod with production values
```

### 3. Update Deployment Scripts

All deployment scripts have been updated to use the new structure.

### 4. Old Files (Can be removed)

These are now in `docker/` folder:
- `docker-compose.local.yml` → `docker/docker-compose.local.yml`
- `docker-compose.prod.yml` → `docker/docker-compose.prod.yml`

You can keep the root `.env` for non-Docker usage, or remove it.

## Benefits

✅ **Cleaner**: Docker configs separated from app code
✅ **Standard**: Follows industry best practices
✅ **Scalable**: Easy to add staging, testing environments
✅ **No Code Changes**: Switch environments without editing code

