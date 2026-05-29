# Deploy to VPS (Docker)

## What you need

- VPS with Ubuntu 22/24 (1 GB RAM+)
- Public IP (example: `123.45.67.89`)
- SSH access: `ssh root@YOUR_SERVER_IP`
- Ports **3000** and **3001** open in provider firewall

## 1. Push code to GitHub

On your PC:

```bash
git add .
git commit -m "Prepare production deploy"
git push origin main
```

Repo: https://github.com/yevhenbozadzhi/comments-app

## 2. On the server — install Docker

```bash
apt update && apt upgrade -y
apt install -y git docker.io docker-compose-plugin
systemctl enable docker --now
```

## 3. Clone project

```bash
cd /opt
git clone https://github.com/yevhenbozadzhi/comments-app.git
cd comments-app
```

## 4. Configure environment

```bash
cp .env.deploy.example .env.deploy
nano .env.deploy
```

Replace `YOUR_SERVER_IP` with your real IP in:

- `NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3001`
- `CORS_ORIGINS=http://YOUR_SERVER_IP:3000`

Set strong passwords and JWT secrets.

## 5. Build and run

```bash
docker compose -f docker-compose.prod.yml --env-file .env.deploy up --build -d
docker compose -f docker-compose.prod.yml ps
```

## 6. Check

- App: `http://YOUR_SERVER_IP:3000`
- API: `http://YOUR_SERVER_IP:3001/api/health` → `{"message":"OK"}`

## 7. Update README

Add to README.md:

```text
Live demo: http://YOUR_SERVER_IP:3000
```

## Useful commands

```bash
# logs
docker compose -f docker-compose.prod.yml logs -f

# restart after git pull
git pull
docker compose -f docker-compose.prod.yml --env-file .env.deploy up --build -d

# stop
docker compose -f docker-compose.prod.yml down
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site not opening | Open ports 3000, 3001 in VPS firewall / security group |
| Register 500 | Rebuild frontend after fixing `API_URL` in compose |
| Images broken | Check `NEXT_PUBLIC_API_URL` uses server IP, not localhost |
| Socket not updating | Set `CORS_ORIGINS` with `http://IP:3000` |
