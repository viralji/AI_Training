# 🚀 Quick Reference Guide

## Local Development

```bash
cd docker
cp .env.local.example .env.local
nano .env.local  # Update values
./start-local.sh
```

**Access:**
- Backend: http://localhost:3002
- Frontend: http://localhost:8080

---

## Production Deployment

### Step 1: Build & Push Images
```bash
./build-and-push.sh
```

### Step 2: On Server - Setup
```bash
cd docker
cp .env.prod.example .env.prod
nano .env.prod  # Update with production domain & secrets
```

### Step 3: Deploy
```bash
./start-prod.sh
```

Or use complete script:
```bash
./deploy-production-docker.sh
```

---

## Useful Commands

### Docker Images
```bash
# Check Docker Hub
./check-docker-hub.sh

# Build and push
./build-and-push.sh
```

### Local Development
```bash
cd docker
./start-local.sh           # Start
docker-compose -f docker-compose.local.yml logs -f  # Logs
docker-compose -f docker-compose.local.yml down     # Stop
```

### Production
```bash
cd docker
./start-prod.sh                                    # Start
docker-compose -f docker-compose.prod.yml logs -f  # Logs
docker-compose -f docker-compose.prod.yml down     # Stop
```

### Validation
```bash
./validate-deployment.sh
```

---

## File Locations

| What | Where |
|------|-------|
| Docker configs | `docker/` |
| Documentation | `docs/` |
| Local env | `docker/.env.local` |
| Production env | `docker/.env.prod` |
| Main README | `README.md` |

---

## Need Help?

- **Docker Guide:** `docker/README.md`
- **All Docs:** `docs/README.md`
- **Status:** `FINAL_STATUS.md`

