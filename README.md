# Brownies Landing Page — Docker Deploy

## Files
- `Dockerfile`         — Nginx alpine serving the landing page
- `docker-compose.yaml` — Easy one-command deployment
- `brownies-landing.html` — The landing page (served as index.html)

## Quick Start

```bash
# 1. Build & run
docker-compose up -d

# 2. Open in browser
open http://localhost:8080

# 3. Stop when done
docker-compose down
```

## Custom Domain

To put it on a real domain, add this to `docker-compose.yaml`:

```yaml
services:
  brownies:
    ports:
      - "80:80"   # HTTP
    # or with labels for a reverse proxy (Traefik / Caddy)
```

## One-liner without compose

```bash
docker build -t brownies-landing .
docker run -d -p 8080:80 --name brownies brownies-landing
```
