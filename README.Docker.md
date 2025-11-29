# Docker Setup Guide

This guide explains how to run the PocketLLM application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Ollama installed and running (either on host or in Docker)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Services

### Backend Service
- **Container name:** `pocketllm-backend`
- **Port:** 8000
- **Technology:** FastAPI (Python 3.9)
- **Database:** SQLite (persisted in `chat_app.db`)
- **Ollama:** Connects to Ollama service (see Ollama Setup below)

### Frontend Service
- **Container name:** `pocketllm-frontend`
- **Port:** 3000
- **Technology:** React with Vite, served by Nginx
- **Proxy:** API requests are proxied to the backend automatically

## Ollama Setup

The backend requires Ollama to be running for LLM functionality. You have two options:

### Option 1: Ollama on Host Machine (Recommended for Development)

1. Install Ollama on your host machine: https://ollama.ai
2. Start Ollama: `ollama serve`
3. Pull required models:
   ```bash
   ollama pull gemma2:2b
   ollama pull llama2
   ollama pull mistral
   ```
4. The backend container will automatically connect to Ollama on the host via `host.docker.internal`

### Option 2: Ollama in Docker

1. Uncomment the `ollama` service in `docker-compose.yml`
2. Update the `OLLAMA_HOST` environment variable in the backend service to `ollama:11434`
3. Start services: `docker-compose up -d`
4. Pull models in the Ollama container:
   ```bash
   docker exec -it pocketllm-ollama ollama pull gemma2:2b
   docker exec -it pocketllm-ollama ollama pull llama2
   docker exec -it pocketllm-ollama ollama pull mistral
   ```

## Docker Compose Commands

### Start services
```bash
docker-compose up
```

### Start services in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild services
```bash
docker-compose up --build
```

### Stop and remove containers, networks, and volumes
```bash
docker-compose down -v
```

## Database Persistence

The SQLite database (`chat_app.db`) is persisted as a volume mount, so your data will survive container restarts. The database file is stored in the project root directory.

## Environment Variables

You can customize the backend by setting environment variables in `docker-compose.yml`:

- `DATABASE_URL`: Database connection string (default: `sqlite:///chat_app.db`)
- `OLLAMA_HOST`: Ollama service host (default: `host.docker.internal:11434` for host Ollama, or `ollama:11434` for Docker Ollama)

## Troubleshooting

### Backend won't start
1. Check logs: `docker-compose logs backend`
2. Ensure port 8000 is not already in use
3. Verify the database file permissions

### Frontend won't connect to backend
1. Check that both services are running: `docker-compose ps`
2. Verify the nginx proxy configuration
3. Check browser console for CORS errors

### Rebuild after code changes
```bash
docker-compose up --build
```

### Clean rebuild (removes old images)
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Development vs Production

### Development
For development, you may want to mount your source code as volumes for hot-reloading:

```yaml
volumes:
  - .:/app
  - ./chat_app.db:/app/chat_app.db
```

### Production
The current setup is production-ready with:
- Optimized multi-stage builds
- Nginx for serving static files
- Health checks
- Automatic restarts

## Default Admin Account

- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default admin password in production!**

## Network

Both services are connected via a Docker network (`pocketllm-network`), allowing them to communicate using service names:
- Frontend can reach backend at `http://backend:8000`
- Backend is accessible from host at `http://localhost:8000`

