# Docker Setup Guide - PocketLLM

This guide explains how to run the PocketLLM application using Docker and Docker Compose.

## Prerequisites

- Docker installed ([download](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)
- Ollama installed and running on your machine ([download](https://ollama.ai))
- At least 2GB of free disk space

## Quick Start (4 Steps)

### 1. Start Ollama (Terminal 1)
```bash
ollama serve
```

**Expected:** `Listening on 127.0.0.1:11434`

### 2. Navigate to Project (Terminal 2)
```bash
cd team18-pocket-llm
```

### 3. Build and Start Docker Services
```bash
docker-compose up --build
```

**Expected Output:**
```
pocketllm-backend running on 0.0.0.0:8000
pocketllm-frontend running on 0.0.0.0:3000
```

### 4. Access the Application

Open your browser and go to: **http://localhost:3000**

Login with default credentials:
- **Username:** `admin`
- **Password:** `admin123`

---

## Services Overview

| Service  | Container Name    | Port  | Purpose                    | Location |
|----------|-------------------|-------|----------------------------|----------|
| Ollama   | N/A (Host)        | 11434 | LLM Engine                 | Your machine |
| Backend  | pocketllm-backend | 8000  | FastAPI Server             | Docker |
| Frontend | pocketllm-frontend| 3000  | React Web Interface        | Docker |

---

## Useful Commands

### Start services in background
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services
```bash
docker-compose down
```

### Rebuild without cache (clean build)
```bash
docker-compose up --build --no-cache
```

### Run commands inside containers
```bash
# Backend
docker exec -it pocketllm-backend bash

# Frontend
docker exec -it pocketllm-frontend sh
```

---

## First Time Setup

### Prerequisites
1. **Start Ollama on your machine first** (Terminal 1):
   ```bash
   ollama serve
   ```
   - Wait for: `Listening on 127.0.0.1:11434`

2. **Build and start Docker containers** (Terminal 2):
   ```bash
   docker-compose up --build
   ```

When you first run `docker-compose up --build`, the system will:

1. **Build backend image** (~5-7 minutes)
   - Installs Python dependencies from requirements.txt
   - Creates optimized multi-stage image
   - ~1.5GB final image size

2. **Build frontend image** (~2-3 minutes)
   - Installs Node dependencies
   - Builds React application
   - ~400MB final image size

3. **Start backend** (~5-10 seconds)
   - Connects to Ollama at `host.docker.internal:11434`
   - Creates SQLite database
   - Initializes default admin user
   - Sets up API routes

4. **Start frontend** (~3-5 seconds)
   - Serves React app on port 3000

**Total initial startup time:** ~10-15 minutes (mostly building Docker images)

### Pulling LLM Models

```bash
# On your machine (where Ollama is running), pull models:
ollama pull gemma2:2b        # ~2GB - Recommended for testing
ollama pull mistral          # ~4GB
ollama pull llama2           # ~4GB
ollama pull neural-chat      # ~4GB

# List available models
ollama list
```

---

## Important Notes

### Pip Caching
The multi-stage Dockerfile uses a technique to cache pip dependencies:
- Dependencies are installed during the **builder stage**
- Only Python source code changes trigger rebuild of dependencies
- This significantly speeds up subsequent builds

### Database Persistence
The `chat_app.db` file is mounted as a volume and persists between container restarts:
```yaml
volumes:
  - ./chat_app.db:/app/chat_app.db
```

### Static Files
Static assets are also mounted to allow hot updates:
```yaml
volumes:
  - ./static:/app/static
```

### Ollama Storage
Models are stored on your machine in:
```
C:\Users\<YourUsername>\.ollama\
```

This keeps Docker images small and allows easy model management!

---

## Troubleshooting

### Port Already in Use
If port 3000 or 8000 is already in use:

```bash
# Windows - find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

Or modify `docker-compose.yml` to use different ports:
```yaml
ports:
  - "3001:3000"  # frontend
  - "8001:8000"  # backend
```

### Backend Can't Connect to Ollama
**Make sure Ollama is running on your machine:**
```bash
ollama serve
```

If still having issues, check that Ollama is listening:
```bash
curl http://localhost:11434/api/tags
```
Ensure Ollama healthcheck passes:
```bash
docker-compose logs ollama
```

The backend waits for Ollama to be healthy before starting.

### Frontend Not Connecting to Backend
- Check backend is running: `docker-compose logs backend`
- Verify port 8000 is accessible: `curl http://localhost:8000/docs`
- Check frontend logs: `docker-compose logs frontend`

### Out of Disk Space
If Docker build fails due to space:
```bash
# Clean up unused images/volumes
docker system prune -a --volumes

# Check disk usage
docker system df
```

---

## Performance Tips

1. **Allocate sufficient resources to Docker:**
   - Desktop Settings → Resources
   - Minimum: 4GB RAM, 2 CPUs
   - Recommended: 8GB RAM, 4 CPUs

2. **Use smaller models for better performance:**
   - `gemma2:2b` - Fast, good for testing (~2GB)
   - `mistral` - Balanced performance/quality (~4GB)
   - `llama2` - Higher quality, slower (~4GB)

3. **Enable BuildKit for faster builds:**
   ```bash
   set DOCKER_BUILDKIT=1
   docker-compose up --build
   ```

---## Production Considerations

**Before deploying to production:**

1. **Change default admin password**
   - Update in database or application configuration
   - Never use `admin123` in production

2. **Use environment variables**
   - Add `.env` file for secrets
   - Don't commit sensitive data to git

3. **Enable CORS properly**
   - Replace `allow_origins=["*"]` in `main.py`
   - Specify exact frontend URL

4. **Use proper reverse proxy**
   - Add Nginx or Traefik
   - Handle SSL/TLS certificates

5. **Database backup strategy**
   - Mount database to persistent storage
   - Implement regular backups

6. **Resource limits**
   - Set CPU and memory limits in docker-compose.yml:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 2G
   ```

---

## File Structure

```
team18-pocket-llm/
├── Dockerfile.backend        # Backend multi-stage build
├── docker-compose.yml        # Service orchestration
├── .dockerignore              # Exclude files from build
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── pocketllm-frontend 6/
│   ├── Dockerfile            # Frontend multi-stage build
│   ├── .dockerignore          # Exclude files from build
│   ├── package.json           # Node dependencies
│   └── src/                   # React source code
└── DOCKER.md                  # This file
```

---

## Getting Help

- Backend API docs: http://localhost:8000/docs
- Ollama API: http://localhost:11434/api
- Frontend: http://localhost:3000
- Check logs: `docker-compose logs [service]`

---

## Next Steps

1. Services are running
2. Create your first chat
3. 👤 Create additional user accounts
4. 🔑 Generate API keys (for developers)
5. Explore admin dashboard

Happy coding!
