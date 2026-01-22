# KSA Custom ERP - Production Deployment Guide

This guide provides step-by-step instructions to deploy the KSA Custom ERP system on your Ubuntu server using Docker.

## Prerequisites

Your server should have:
- Ubuntu Server (18.04 or later)
- Docker installed
- Docker Compose installed
- Git installed
- Ports 8000 and 3000 available

## Deployment Steps

### 1. Connect to Your Server

```bash
ssh your-username@your-server-ip
```

### 2. Clone the Repository

```bash
# Navigate to your desired directory
cd /opt  # or any directory you prefer

# Clone the repository
git clone https://github.com/armandusbasson/KSA-PSMS.git

# Navigate into the project directory
cd KSA-PSMS
```

### 3. Configure Environment Variables

Create a `.env` file with your server's configuration:

```bash
# Copy the example file
cp .env.example .env

# Edit the configuration
nano .env
```

Update the `VITE_API_BASE_URL` to match your server:

```env
# Backend Configuration
DATABASE_URL=sqlite:////app/db/app.db
DEBUG=true

# Frontend Configuration
# Replace with your server's IP address or domain
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8000
```

**Examples:**
- For IP address: `VITE_API_BASE_URL=http://192.168.1.100:8000`
- For domain: `VITE_API_BASE_URL=http://erp.yourcompany.com:8000`
- With Nginx (no port): `VITE_API_BASE_URL=http://erp.yourcompany.com/api`

**Important:** Press `Ctrl+X`, then `Y`, then `Enter` to save in nano.

### 4. Build and Start the Application

```bash
# Build and start all services in detached mode
docker compose up --build -d
```

**Note:** The build process reads the `VITE_API_BASE_URL` from your `.env` file and bakes it into the frontend build. If you change the server IP/domain later, you'll need to rebuild: `docker compose up --build -d`

This command will:
- Build the backend (Python/FastAPI) container
- Build the frontend (React/TypeScript) container
- Start both containers in the background
- Create the SQLite database automatically

**Expected output:**
```
[+] Building ... (backend)
[+] Building ... (frontend)
[+] Running 2/2
✔ Container ksa_backend   Started
✔ Container ksa_frontend  Started
```

### 5. Verify Deployment

Check that containers are running:
```bash
docker ps
```

You should see two containers:
- `ksa_backend` (port 8000)
- `ksa_frontend` (port 3000)

### 6. Access the Application

- **Frontend:** http://your-server-ip:3000
- **Backend API:** http://your-server-ip:8000
- **API Documentation:** http://your-server-ip:8000/docs

### 7. Default Login Credentials

**Username:** `admin`  
**Password:** `admin123`

⚠️ **IMPORTANT:** Change the default admin password immediately after first login through User Management.

## Production Recommendations

### 1. Change Secret Key

Edit `backend/app/utils/auth.py` and replace the default secret key:
```python
SECRET_KEY = "your-very-secure-random-string-here"
```

Generate a secure key:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Use a Reverse Proxy (Nginx)

For production, use Nginx as a reverse proxy to:
- Serve both frontend and backend on port 80/443
- Enable SSL/HTTPS
- Handle static files efficiently

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Enable Firewall

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS (if using Nginx)
sudo ufw allow 80
sudo ufw allow 443

# Or allow direct access to app ports
sudo ufw allow 3000
sudo ufw allow 8000

# Enable firewall
sudo ufw enable
```

### 4. Set Up Automatic Backups

Backup the SQLite database regularly:
```bash
# Create backup script
cat > /opt/backup-ksa.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/ksa-erp"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker cp ksa_backend:/app/db/ksa_erp.db $BACKUP_DIR/ksa_erp_$DATE.db
# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
EOF

chmod +x /opt/backup-ksa.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-ksa.sh") | crontab -
```

## Common Operations

### View Logs

```bash
# View all logs
docker compose logs

# Follow logs (live)
docker compose logs -f

# View specific service logs
docker logs ksa_backend
docker logs ksa_frontend
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker restart ksa_backend
docker restart ksa_frontend
```

### Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes database)
docker compose down -v
```

### Update Application

```bash
# Navigate to project directory
cd /opt/KSA-PSMS

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up --build -d
```

### Check Database

```bash
# Access the database container
docker exec -it ksa_backend bash

# Inside container, access database
cd db
sqlite3 ksa_erp.db

# View tables
.tables

# Exit SQLite
.exit

# Exit container
exit
```

## Troubleshooting

### Frontend Points to Wrong Server / localhost

If the frontend is trying to connect to localhost instead of your server:

1. **Check your `.env` file:**
   ```bash
   cat .env
   ```
   Make sure `VITE_API_BASE_URL` points to your server's IP or domain, not localhost.

2. **Rebuild the frontend:**
   ```bash
   # The API URL is baked in at build time
   docker compose up --build -d frontend
   ```

3. **Verify the build used correct URL:**
   ```bash
   # Check frontend logs during build
   docker compose logs frontend
   ```

### Containers Won't Start

```bash
# Check logs
docker compose logs

# Remove old containers and rebuild
docker compose down
docker compose up --build -d
```

### Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

### Database Issues

```bash
# Reset database (⚠️ deletes all data)
docker compose down -v
docker compose up -d
```

### Cannot Access from Browser

1. Check firewall rules
2. Verify containers are running: `docker ps`
3. Check if ports are accessible: `curl http://localhost:3000`
4. Check server's public IP or domain

### Frontend Shows White Screen

```bash
# Rebuild frontend
docker compose up --build -d frontend
```

## System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 2 GB
- **Disk:** 10 GB
- **Network:** 10 Mbps

### Recommended for Production
- **CPU:** 4 cores
- **RAM:** 4 GB
- **Disk:** 50 GB (for database growth)
- **Network:** 100 Mbps

## Support

For issues or questions:
1. Check the logs: `docker compose logs`
2. Review this guide's troubleshooting section
3. Check the GitHub repository: https://github.com/armandusbasson/KSA-PSMS

---

**Last Updated:** January 2026
