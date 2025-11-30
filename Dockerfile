# Backend Dockerfile - FastAPI Application# Use Python 3.9 slim image as base

# Multi-stage build to keep image size smallFROM python:3.9-slim



FROM python:3.9-slim as builder# Set working directory

WORKDIR /app

WORKDIR /app

# Set environment variables

# Copy requirements first to leverage Docker cacheENV PYTHONUNBUFFERED=1 \

COPY requirements.txt .    PYTHONDONTWRITEBYTECODE=1 \

    PIP_NO_CACHE_DIR=1 \

# Create a virtual environment    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN python -m venv /opt/venv

# Install system dependencies

# Activate venv and install dependenciesRUN apt-get update && apt-get install -y \

ENV PATH="/opt/venv/bin:$PATH"    gcc \

RUN pip install --no-cache-dir -r requirements.txt    curl \

    && rm -rf /var/lib/apt/lists/*

# Final stage

FROM python:3.9-slim# Copy requirements first for better caching

COPY requirements.txt .

WORKDIR /app

# Install Python dependencies with retry logic

# Copy virtual environment from builderRUN pip install --upgrade pip setuptools wheel && \

COPY --from=builder /opt/venv /opt/venv    pip install --retries 5 --timeout 1000 -r requirements.txt



# Set environment variables# Copy application code

ENV PATH="/opt/venv/bin:$PATH" \COPY . .

    PYTHONUNBUFFERED=1

# Create static directory if it doesn't exist

# Copy application codeRUN mkdir -p static

COPY . .

# Expose port

# Create static directory if it doesn't existEXPOSE 5000

RUN mkdir -p static

# Health check

# Expose portHEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \

EXPOSE 8000    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health').read()"



# Run the application# Run the application

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]

