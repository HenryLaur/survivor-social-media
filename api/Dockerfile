FROM python:3.9-slim

WORKDIR /api

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency files first
COPY pyproject.toml .

# Install dependencies
RUN pip install --no-cache-dir pip --upgrade && \
    pip install --no-cache-dir ".[dev]" || \
    pip install --no-cache-dir . && \
    pip install --no-cache-dir ruff

# Copy rest of the application
COPY . .

# Expose port
EXPOSE 8000

# Change working directory to root
WORKDIR /

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"] 