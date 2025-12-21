# 🚀 Deploy to Fly.io - Quick Guide

## Prerequisites

1. Sign up at https://fly.io (free account)
2. Install flyctl CLI tool

## Installation (Windows)

```powershell
# Download and install flyctl
# Visit: https://fly.io/docs/hands-on/install-flyctl/
# Or use PowerShell:
iwr https://fly.io/install.ps1 -useb | iex
```

Or download from: https://github.com/superfly/flyctl/releases

## Quick Deployment Steps

### 1. Login to Fly.io

```bash
flyctl auth login
```

### 2. Initialize Fly.io App (First time only)

```bash
flyctl launch
```

This will:
- Detect your Dockerfile
- Ask for app name (or generate one)
- Ask about region (choose closest to you)
- Create `fly.toml` configuration file

### 3. Deploy!

```bash
flyctl deploy
```

That's it! Your app will be deployed.

### 4. Check Status

```bash
flyctl status
```

### 5. View Logs

```bash
flyctl logs
```

## Your App URL

After deployment, you'll get a URL like:
- `https://your-app-name.fly.dev`

## Important Configuration for Database Persistence

Since your app uses SQLite, you need persistent storage. Add a volume:

```bash
# Create a volume
flyctl volumes create chat_db --size 1

# Attach it to your app
# Edit fly.toml and add:
[mounts]
  source="chat_db"
  destination="/app/server"
```

Or use Fly's persistent storage:

```bash
# Create persistent volume
flyctl volumes create data --size 1 --region <your-region>
```

Then update your `fly.toml`:

```toml
[mounts]
  source = "data"
  destination = "/app/server"
```

## Environment Variables (if needed)

```bash
flyctl secrets set PORT=5000
```

## Useful Commands

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# SSH into container (for debugging)
flyctl ssh console

# Scale app
flyctl scale count 1

# Check app status
flyctl status

# Open app in browser
flyctl open
```

## Image Size Optimization

The Dockerfile is optimized for smaller image size (~150-200MB):
- ✅ Uses Alpine Linux (smaller base image)
- ✅ Multi-stage build (removes build dependencies)
- ✅ Removes source files after build
- ✅ Removes source maps
- ✅ Cleans npm cache
- ✅ Only production dependencies

## Troubleshooting

### App won't start?
```bash
flyctl logs
```

### Database not persisting?
- Make sure you created and attached a volume
- Check volume mount in `fly.toml`

### Port issues?
- Default port is 5000 (configured in Dockerfile)
- Fly.io automatically maps port 8080 externally
- If needed, update `fly.toml`:

```toml
[[services]]
  internal_port = 5000
  protocol = "tcp"
```

## Free Tier Limits

Fly.io free tier includes:
- 3 shared-cpu VMs
- 3GB persistent volumes
- 160GB outbound data transfer
- Free SSL (HTTPS)

Perfect for your chat app! 🎉

---

**Ready to deploy? Run `flyctl launch` and follow the prompts!**

