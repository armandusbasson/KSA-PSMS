# Production Deployment Guide - Kulkoni SA Power Station Management System

## Pre-Deployment Checklist

- [ ] All code tested locally
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Backup strategy defined
- [ ] Monitoring setup prepared
- [ ] Team trained on operations

---

## Docker Compose Production Deployment

### Step 1: Prepare Server

```bash
# SSH into your server
ssh user@your-server.com

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Clone Repository

```bash
cd /opt
sudo git clone <repository-url> ksa-power-stations
cd ksa-power-stations
```

### Step 3: Configure Environment

```bash
# Create production .env files
cat > backend/.env << EOF
DATABASE_URL=sqlite:////app/db/app.db
DEBUG=false
ENVIRONMENT=production
API_TITLE=Kulkoni SA Power Station Management API
API_VERSION=1.0.0
EOF

cat > frontend/.env << EOF
VITE_API_BASE_URL=https://your-domain.com/api
EOF

# Update permissions
sudo chown -R $USER:$USER .
chmod 600 backend/.env frontend/.env
```

### Step 4: Update docker-compose.yml for Production

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ksa_backend
    restart: always
    environment:
      - DATABASE_URL=sqlite:////app/db/app.db
      - DEBUG=false
      - ENVIRONMENT=production
    volumes:
      - db_volume:/app/db
      - /var/log/ksa:/app/logs
    networks:
      - ksa_network
    expose:
      - 8000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ksa_frontend
    restart: always
    environment:
      - VITE_API_BASE_URL=https://your-domain.com/api
    networks:
      - ksa_network
    expose:
      - 3000

  nginx:
    image: nginx:latest
    container_name: ksa_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    networks:
      - ksa_network
    depends_on:
      - backend
      - frontend

volumes:
  db_volume:
    driver: local

networks:
  ksa_network:
    driver: bridge
```

### Step 5: Setup Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    upstream backend {
        server ksa_backend:8000;
    }

    upstream frontend {
        server ksa_frontend:3000;
    }

    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API proxy
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API docs
        location /docs {
            proxy_pass http://backend/docs;
            proxy_set_header Host $host;
        }

        location /redoc {
            proxy_pass http://backend/redoc;
            proxy_set_header Host $host;
        }

        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Step 6: SSL Certificates

**Option A: Let's Encrypt (Recommended)**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

**Option B: Self-Signed (Development)**

```bash
mkdir ssl
openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365
```

### Step 7: Deploy Application

```bash
# Pull latest code
git pull origin main

# Build and start services
docker-compose up -d --build

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

### Step 8: Initialize Database

```bash
# Verify database file exists and is writable
sudo ls -la db_volume/

# Backend automatically initializes on startup
docker-compose logs backend | grep "Creating"
```

---

## Backup & Recovery

### Automated Backup Script

Create `/opt/ksa-power-stations/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/ksa"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/app_db_$DATE.sqlite"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker volume inspect ksa-power-stations_db_volume > /dev/null && \
  docker run --rm -v ksa-power-stations_db_volume:/dbdata \
    -v $BACKUP_DIR:/backup \
    alpine sh -c "cp -r /dbdata/* /backup/latest/ 2>/dev/null || true && cp /dbdata/app.db /backup/app_db_$DATE.sqlite"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "app_db_*.sqlite" -mtime +30 -delete

echo "Backup completed: $DB_BACKUP"
```

### Cron Schedule

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /opt/ksa-power-stations/backup.sh >> /var/log/ksa_backup.log 2>&1
```

### Restore from Backup

```bash
# Stop services
docker-compose down

# Restore database
docker run --rm -v ksa-power-stations_db_volume:/dbdata \
  -v /backups/ksa:/backup \
  alpine sh -c "rm -rf /dbdata/* && cp /backup/app_db_YYYYMMDD_HHMMSS.sqlite /dbdata/app.db"

# Start services
docker-compose up -d
```

---

## Monitoring & Logging

### Health Checks

```bash
# API health
curl https://your-domain.com/health

# Database check (should see response)
curl https://your-domain.com/api/sites?limit=1
```

### Log Monitoring

```bash
# All services
docker-compose logs -f --tail 100

# Specific service
docker-compose logs -f backend

# Nginx access logs
tail -f logs/nginx/access.log
```

### Prometheus Metrics (Optional)

Add to docker-compose.yml:

```yaml
prometheus:
  image: prom/prometheus
  container_name: ksa_prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  networks:
    - ksa_network
```

---

## Performance Optimization

### Backend Optimization

```python
# In main.py, add:
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Database Optimization

```bash
# SSH into backend container
docker exec -it ksa_backend bash

# Analyze database
sqlite3 /app/db/app.db "ANALYZE;"
```

### Caching Layer

For high-traffic deployments, add Redis:

```yaml
redis:
  image: redis:7-alpine
  container_name: ksa_redis
  ports:
    - "6379:6379"
  networks:
    - ksa_network
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Separate Database:** Migrate from SQLite to PostgreSQL
2. **Load Balancer:** Use HAProxy or AWS ALB
3. **Multiple Backend Instances:** Scale backend replicas
4. **Static Assets:** Serve from CDN (CloudFront, Cloudflare)

### Vertical Scaling

1. Increase container resource limits
2. Optimize database queries with indexing
3. Enable caching strategies

---

## Security Hardening

### Application Security

```python
# In main.py, add:
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### Docker Security

```bash
# Run containers as non-root
docker run --user 1000:1000 ...

# Use read-only filesystems where possible
volumes:
  - /app/db:rw
```

### Network Security

- [ ] Enable UFW firewall
- [ ] Restrict SSH access (key-based only)
- [ ] Use VPN for administration
- [ ] DDoS protection (Cloudflare, AWS Shield)

---

## Maintenance Tasks

### Daily
- [ ] Check application logs
- [ ] Verify services are running
- [ ] Monitor disk space

### Weekly
- [ ] Review error logs
- [ ] Check database size
- [ ] Verify backups

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize database
- [ ] Test recovery procedures
- [ ] Update SSL certificates if needed

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check resource availability
docker stats

# Review logs
docker-compose logs --no-pager
```

### Database Locked

```bash
# Stop services
docker-compose down

# Reset database
docker volume rm ksa-power-stations_db_volume

# Restart
docker-compose up -d
```

### High Memory Usage

```bash
# Check container limits
docker stats

# Update docker-compose.yml:
services:
  backend:
    mem_limit: 512m
    memswap_limit: 512m
```

---

## Support & Contact

For issues during deployment:
1. Check logs: `docker-compose logs`
2. Verify services: `docker-compose ps`
3. Test connectivity: `curl http://localhost:8000/health`
4. Review nginx config: `docker exec ksa_nginx nginx -t`

---

**Production Deployment Version:** 1.0.0
**Last Updated:** January 6, 2026
