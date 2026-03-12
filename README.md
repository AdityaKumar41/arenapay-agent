# arenapay

AI-powered, reputation-aware payment gateway on TON blockchain. Built for the IdentityHub AI Hackathon.

## Overview

arenapay uses the **ARES Protocol** (AI Reputation & Escrow System) to assign reputation scores to TON wallets and dynamically adjust payment terms — collateral requirements, fees, and transaction limits — based on a wallet's trustworthiness.

### How It Works

1. **ARES Score (0-100):** Computed from on-chain transaction history (50%), IdentityHub DID verification (30%), and behavioral analysis (20%)
2. **5-Tier System:** Untrusted → Basic → Verified → Trusted → Elite
3. **Dynamic Collateral:** Higher reputation = lower collateral (200% → 20%)
4. **Real-time Threat Detection:** Blocks transactions to malicious contracts, detects drain patterns, flags bot behavior

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────────┐
│  Telegram Mini   │────▶│  Express API │────▶│  ARES Oracle      │
│  App (React)     │◀────│  (Node.js)   │◀────│  (Python FastAPI)  │
│                  │     │              │     │                    │
│  - TON Connect   │     │  - Prisma    │     │  - Scoring Engine  │
│  - Framer Motion │     │  - Redis     │     │  - Threat Detector │
│  - Socket.io     │     │  - Socket.io │     │  - IdentityHub     │
└─────────────────┘     └──────┬───────┘     └────────┬──────────┘
                               │                       │
                        ┌──────▼───────┐        ┌──────▼──────────┐
                        │  PostgreSQL  │        │  TON Blockchain  │
                        │  + Redis     │        │  (Testnet)       │
                        └──────────────┘        │  - AresRegistry  │
                                                │  - ArenapayEscrow│
                                                └─────────────────┘
```

## Project Structure

```
arenapay/
├── apps/
│   ├── mini-app/       # React + Vite + TypeScript Telegram Mini-App
│   ├── api/            # Express + TypeScript backend API
│   └── oracle/         # Python FastAPI AI scoring oracle
├── packages/
│   └── contracts/      # TON smart contracts (Tact/Blueprint)
└── scripts/            # Demo & seed scripts
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Python >= 3.11
- Docker & Docker Compose

### Development

```bash
# Install dependencies
npm install

# Start infrastructure (Postgres + Redis)
docker compose up postgres redis -d

# Setup database
cd apps/api && npx prisma migrate dev && cd ../..

# Install Python dependencies
cd apps/oracle && pip install -r requirements.txt && cd ../..

# Start all services (in separate terminals)
cd apps/oracle && uvicorn src.main:app --reload --port 8000
cd apps/api && npm run dev
cd apps/mini-app && npm run dev
```

### Docker (full stack)

```bash
docker compose up --build
```

Services:

- Mini-App: http://localhost:80
- API: http://localhost:3000
- Oracle: http://localhost:8000

### Smart Contracts

```bash
cd packages/contracts

# Run tests
npx blueprint test

# Deploy to testnet
npx blueprint run deployAresRegistry --testnet
npx blueprint run deployArenapayEscrow --testnet
```

## Demo

```bash
# Seed demo wallets
npx tsx scripts/seed-demo-wallets.ts

# Verify all services
./scripts/demo-flow.sh
```

### Demo Wallets

| Wallet         | Tier      | Score | Collateral | Fee Discount |
| -------------- | --------- | ----- | ---------- | ------------ |
| Elite Trader   | Elite     | 85+   | 20%        | 50%          |
| New User       | Basic     | ~35   | 150%       | 0%           |
| Flagged Wallet | Untrusted | <20   | BLOCKED    | N/A          |

### Demo Flow (< 8 seconds)

1. Connect wallet via TON Connect
2. View ARES reputation score and tier badge
3. Send payment — see dynamic collateral preview
4. Observe real-time score update via WebSocket
5. Attempt transaction from flagged wallet — blocked with threat alert

## API Endpoints

### Backend API (`/api/v1`)

| Method | Path                        | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/reputation/:addr`         | Get wallet score and tier |
| POST   | `/reputation/:addr/refresh` | Force score recompute     |
| GET    | `/reputation/:addr/history` | 30-day score history      |
| POST   | `/payment/preview`          | Preview payment terms     |
| POST   | `/payment/execute`          | Build settlement message  |
| POST   | `/threat/check`             | Run threat assessment     |
| POST   | `/identity/verify`          | Start DID verification    |

### Oracle (`/`)

| Method | Path              | Description             |
| ------ | ----------------- | ----------------------- |
| POST   | `/score/compute`  | Compute ARES score      |
| GET    | `/score/:addr`    | Cached score lookup     |
| POST   | `/threat/analyze` | Threat analysis         |
| GET    | `/identity/:addr` | Mock IdentityHub lookup |

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand, TanStack Query
- **Backend:** Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.io
- **Oracle:** Python, FastAPI, NumPy
- **Blockchain:** TON, Tact, Blueprint, TON Connect
- **Infra:** Docker Compose, Nginx, Turborepo

## License

MIT
