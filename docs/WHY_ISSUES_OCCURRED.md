# Why We Had So Many Errors - Root Cause Analysis

## Issues We Encountered

1. **Database corruption** - "database disk image is malformed"
2. **Assignment not found** - Missing assignments in database
3. **Scoring not working** - Submissions not being scored
4. **URL redirect issues** - Redirecting to localhost:5173 instead of Docker URL

---

## Root Causes

### 1. Database Path Mismatch ❌

**Problem:**
- Code hardcoded: `join(__dirname, '../../database.sqlite')`
- Docker mounted: `./backend/test-db/database.sqlite:/app/database.sqlite`
- Result: Code looked in wrong location, database never initialized correctly

**Fix:**
- Now uses `DATABASE_PATH` environment variable
- Consistent path resolution in both Docker and non-Docker
- Docker compose sets `DATABASE_PATH=/app/database.sqlite` explicitly

### 2. No Automatic Seeding ❌

**Problem:**
- Assignments had to be seeded manually
- Easy to forget, especially with fresh database
- No validation that assignments exist

**Fix:**
- Auto-seeding on startup in `database.js`
- Checks if assignments exist, creates them if not
- Logs clearly show seeding status

### 3. Scoring Queue Bug ❌

**Problem:**
- `scoringQueue.addToQueue()` returned `true` instead of promise
- Promise chain broken, errors not caught
- Queue processed but silently failed

**Fix:**
- Now returns `queuePromise` correctly
- Proper error handling in promise chain
- Better logging for debugging

### 4. Complex Docker Setup ❌

**Problem:**
- Multiple docker-compose files (local, prod, regular)
- Inconsistent paths and configurations
- Hard to know which one to use

**Fix:**
- Simplified to two files: `local` and `prod`
- Consistent patterns across both
- Clear documentation

### 5. Missing Environment Variables ❌

**Problem:**
- `FRONTEND_URL` not set in Docker
- Defaulted to `localhost:5173`
- OAuth redirects went to wrong URL

**Fix:**
- Docker compose sets `FRONTEND_URL` explicitly
- Environment variables clearly documented
- Validation script checks all required vars

---

## Why It Took So Long

### Lack of Validation
- No automated checks before deployment
- Issues only discovered after deployment
- Had to debug in production

### Insufficient Testing
- Didn't test Docker setup end-to-end locally first
- Assumed it would work like non-Docker version
- Differences between environments not caught

### Silent Failures
- Scoring queue failed silently (no error logs)
- Database path issues not obvious
- Missing assignments only discovered when trying to use

### Complexity
- Too many moving parts (multiple compose files, paths, etc.)
- Hard to understand what was happening
- Difficult to debug

---

## How We Prevent This Now

### 1. Validation Script ✅
- `validate-deployment.sh` checks everything before deployment
- Catches configuration issues early
- Clear error messages

### 2. Auto-Seeding ✅
- No manual steps required
- Works automatically on first run
- Clear logging shows what happened

### 3. Consistent Configuration ✅
- Single source of truth for paths
- Environment variables used consistently
- Docker compose sets everything explicitly

### 4. Better Error Handling ✅
- Proper promise handling
- Comprehensive logging
- Stack traces for debugging

### 5. Simplified Setup ✅
- Two compose files (local/prod) instead of three
- Clear documentation
- Consistent patterns

---

## Lessons Learned

1. **Always validate before deployment** - Use the validation script
2. **Test locally first** - Don't assume production will work
3. **Use environment variables** - Don't hardcode paths
4. **Auto-initialize everything** - Don't require manual steps
5. **Log everything** - Make failures visible
6. **Keep it simple** - Fewer moving parts = fewer bugs

---

## For Future Deployments

1. Run `./validate-deployment.sh` ✅
2. Test locally with Docker ✅
3. Check logs immediately after deployment ✅
4. Verify all features work ✅
5. Monitor for first few hours ✅

This prevents the issues we encountered!

