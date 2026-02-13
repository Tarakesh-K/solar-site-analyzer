FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies for MySQL AND dos2unix
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# 1. Fix line endings (in case of Windows users)
# 2. Make the script executable
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 8000

# Use the entrypoint script to start the container
CMD ["./entrypoint.sh"]