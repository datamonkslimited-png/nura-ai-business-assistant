# NURA — Local Setup & Deployment Guide

> **Goal:** Get NURA running locally in 15 minutes, then publicly on a VPS in under 4 hours.

---

## Prerequisites

Install these first:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.12+ | https://python.org |
| Docker | 24+ | https://docker.com |
| Git | any | https://git-scm.com |

---

## Part 1 — Run Locally (15 minutes)

### Step 1: Clone and enter the project

```bash
git clone https://github.com/YOUR_ORG/nura.git
cd nura
```

### Step 2: Set up backend environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:
- `SECRET_KEY` — generate with: `python -c "import secrets; print(secrets.token_hex(32))"`
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com
- `SUPABASE_URL` + keys — from https://supabase.com (create a free project)
- Leave M-Pesa and WhatsApp blank for now (they're needed for production)

### Step 3: Set up frontend environment

```bash
cd ../frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Step 4: Start everything with Docker Compose

```bash
cd ..   # back to the nura/ root
docker compose up -d postgres redis
# Wait 10 seconds for DB to be ready
docker compose up -d backend celery_worker frontend
```

### Step 5: Verify it's running

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |
| Celery Flower | http://localhost:5555 |

### Step 6: Run without Docker (alternative for faster iteration)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

---

## Part 2 — Set Up Supabase Auth

1. Go to https://supabase.com → Create new project
2. Copy your project URL and anon key to `.env` and `.env.local`
3. In Supabase dashboard → Authentication → Providers:
   - Enable **Email** (magic link + OTP)
   - Enable **Phone** (for SMS OTP)
4. Set redirect URL to: `http://localhost:3000/auth/callback`

---

## Part 3 — Set Up WhatsApp Business API (Meta)

1. Go to https://developers.facebook.com → Create app → Business
2. Add **WhatsApp** product
3. Go to WhatsApp → API Setup → copy:
   - **Phone Number ID** → `wa_phone_number_id` in tenant settings
   - **Access Token** → `wa_access_token` in tenant settings
4. Set webhook URL: `https://YOUR_DOMAIN/api/v1/webhooks/whatsapp`
5. Set verify token to match `META_WHATSAPP_VERIFY_TOKEN` in `.env`
6. Subscribe to: `messages`, `message_deliveries`, `message_reads`

---

## Part 4 — Set Up M-Pesa (Safaricom Daraja)

### Sandbox (testing):
1. Go to https://developer.safaricom.co.ke
2. Create app → copy **Consumer Key** and **Consumer Secret**
3. Use shortcode `174379` and passkey from their documentation
4. Set callback URL: `https://YOUR_DOMAIN/api/v1/webhooks/mpesa/callback`

### Go live (production):
- Complete Safaricom business verification
- Submit app for production approval
- Change `MPESA_BASE_URL` to `https://api.safaricom.co.ke`
- Toggle live mode in tenant Settings → M-Pesa

**Test STK Push in sandbox:**
```bash
curl -X POST http://localhost:8000/api/v1/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{"phone": "254708374149", "amount": 1, "reference": "TEST001"}'
```

---

## Part 5 — Deploy Publicly (AWS / VPS)

### Option A: Single VPS (recommended for launch)

**Recommended:** DigitalOcean Droplet or AWS EC2 (t3.small, 2GB RAM)

```bash
# On your VPS:
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git nginx certbot python3-certbot-nginx

# Clone your repo
git clone https://github.com/YOUR_ORG/nura.git /opt/nura
cd /opt/nura/nura

# Set up .env files
cp backend/.env.example backend/.env
# Edit backend/.env with production values (DEBUG=false, ENVIRONMENT=production)

# Start
docker compose -f docker-compose.yml up -d

# Set up SSL with Let's Encrypt
sudo certbot --nginx -d api.nura.datamonks.com -d nura.datamonks.com
```

### Option B: Vercel + Railway (fastest to launch, no server management)

1. **Frontend → Vercel:**
   ```bash
   cd frontend
   npx vercel --prod
   # Set env vars in Vercel dashboard
   ```

2. **Backend → Railway.app:**
   - Connect GitHub repo
   - Add `/nura/backend` as root directory
   - Set environment variables
   - Railway auto-builds from Dockerfile

3. **Database → Supabase or Railway PostgreSQL**

4. **Redis → Railway Redis or Upstash**

### DNS Configuration (datamonks.com)

| Record | Host | Value |
|--------|------|-------|
| A | nura | YOUR_VPS_IP |
| A | api.nura | YOUR_VPS_IP |
| CNAME | www.nura | nura.datamonks.com |

---

## Part 6 — CI/CD with GitHub Actions

The file `.github/workflows/deploy.yml` runs on every push to `main`:

1. Runs tests
2. Builds Docker images
3. Pushes to Docker Hub / ECR
4. SSHs into VPS and pulls latest

Create these GitHub secrets:
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- `DOCKER_USERNAME`, `DOCKER_TOKEN`

---

## Folder Structure

```
nura/
├── frontend/                  # Next.js 15 app
│   ├── src/app/
│   │   ├── page.tsx           # Marketing homepage
│   │   ├── (auth)/            # Sign in, sign up, forgot password
│   │   ├── (dashboard)/       # Tenant dashboard pages
│   │   ├── (admin)/           # NURA admin panel
│   │   └── onboarding/        # TikTok-style onboarding
│   ├── src/components/
│   │   └── layout/            # Sidebar, Topbar
│   └── tailwind.config.ts
│
├── backend/                   # FastAPI app
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── core/              # Config, database, security
│   │   ├── api/v1/            # Route handlers
│   │   ├── integrations/      # WhatsApp, M-Pesa clients
│   │   ├── ai/                # AI router (3-stage)
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── workers/           # Celery tasks
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
│
├── database/
│   └── schema.sql             # Full PostgreSQL schema
│
├── docs/
│   └── SETUP.md               # This file
│
└── docker-compose.yml         # Local dev orchestration
```

---

## Common Issues

**Port already in use:**
```bash
docker compose down
lsof -i :8000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

**Database connection refused:**
```bash
docker compose logs postgres
# Wait for "database system is ready to accept connections"
```

**WhatsApp webhook not receiving messages:**
- Make sure your domain has HTTPS (Meta requires it)
- Use ngrok for local testing: `ngrok http 8000`
- Set webhook URL to: `https://YOUR_NGROK_URL/api/v1/webhooks/whatsapp`

**M-Pesa STK push fails:**
- Check Safaricom Daraja dashboard for error codes
- In sandbox: only use test phone numbers from the docs
- Ensure callback URL is publicly accessible

---

## Support

- Email: datamonkslimited@gmail.com  
- Domain: datamonks.com  
- Umbrella company: robotics.africa
