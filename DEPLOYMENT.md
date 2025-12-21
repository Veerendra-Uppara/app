# 🚀 Deployment Guide for Oracle Cloud

## Deployment Checklist

✅ **Files Ready for Deployment:**
- ✅ `Dockerfile` - Multi-stage build configured
- ✅ `.dockerignore` - Excludes unnecessary files
- ✅ `server/` - All server files included
- ✅ `client/` - Source files (will be built in Docker)
- ✅ `package.json` files - All dependencies defined

## Removed Unnecessary Files

The following files have been removed as they're not needed for deployment:
- ❌ `*.bat` files (Windows development scripts)
- ❌ `server/credentials.js` (unused file)
- ❌ Development scripts

## Quick Deployment Steps

### 1. Build Docker Image

```bash
docker build -t giddaluru-chat:latest .
```

### 2. Test Locally (Optional)

```bash
docker run -p 5000:5000 giddaluru-chat:latest
```

Visit: http://localhost:5000

### 3. Deploy to Oracle Cloud

#### Option A: Oracle Container Registry (OCIR) + Container Instances

```bash
# Login to OCIR
docker login <region-key>.ocir.io
# Example: docker login iad.ocir.io

# Tag image
docker tag giddaluru-chat:latest <region-key>.ocir.io/<tenancy-namespace>/giddaluru-chat:latest

# Push to registry
docker push <region-key>.ocir.io/<tenancy-namespace>/giddaluru-chat:latest
```

Then in OCI Console:
1. Go to **Developer Services** → **Container Instances**
2. Create new Container Instance
3. Use the pushed image
4. Set port: `5000`
5. Configure networking (assign public IP if needed)
6. Deploy!

#### Option B: Direct Docker Image Upload

1. Export Docker image:
```bash
docker save giddaluru-chat:latest | gzip > giddaluru-chat.tar.gz
```

2. Upload to OCI Object Storage
3. Import to Container Registry or use in Container Instances

## Environment Variables

The app uses these environment variables (all optional):

- `PORT` - Server port (default: 5000)

Example:
```bash
docker run -p 5000:5000 -e PORT=5000 giddaluru-chat:latest
```

## Database Persistence

The SQLite database (`chat.db`) is created automatically in the container at `/app/server/chat.db`.

**For production persistence**, consider:
- Using a persistent volume mount in OCI
- Regular backups to Object Storage
- Using OCI File Storage or Block Volume for database file

## Important Notes

1. **Port**: The app runs on port 5000 (configurable via `PORT` env var)
2. **Database**: SQLite file is created automatically - ensure persistent storage for production
3. **Security**: The Dockerfile uses a non-root user for security
4. **Build**: React app is built during Docker build (multi-stage build)

## Troubleshooting

- If the app doesn't start, check container logs: `docker logs <container-id>`
- Verify port mapping matches your OCI configuration
- Ensure database directory has write permissions (handled by Dockerfile)

---

**Ready to deploy! 🎉**

