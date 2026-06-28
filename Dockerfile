FROM nginx:alpine

# Copy landing page
COPY brownies-landing.html /usr/share/nginx/html/index.html

# Custom Nginx config with health check endpoints
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Docker-native health check — pings /health every 30s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
