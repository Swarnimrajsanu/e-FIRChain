# e-FIRChain

A hybrid blockchain FIR (First Information Report) tracking and integrity-verification system. Citizens file FIRs, police verify/investigate them, and a blockchain layer independently proves the records haven't been tampered with.

## Architecture

- **OFF-CHAIN** (PostgreSQL + S3): Full FIR data, citizen info, evidence files, investigation notes, audit logs
- **ON-CHAIN** (Smart Contract): ONLY FIR ID, SHA-256 hash of FIR data, timestamp, and status

**Critical**: The blockchain is an INTEGRITY/AUDIT LAYER, not the database. Never put sensitive data on-chain.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **DB**: PostgreSQL + Prisma ORM
- **Blockchain**: Solidity + Hardhat (local) + ethers.js
- **Auth**: JWT + bcrypt + role-based access control (RBAC)
- **Storage**: S3-compatible object storage

## Roles

- **CITIZEN**: File FIRs, view their own cases, verify integrity
- **POLICE**: Investigate assigned cases, update status
- **ADMIN**: Verify FIRs, assign officers, manage system

## FIR Status Lifecycle

```
SUBMITTED -> UNDER_REVIEW -> VERIFIED -> ASSIGNED ->
INVESTIGATION_IN_PROGRESS -> RESOLVED -> CLOSED
(REJECTED reachable from SUBMITTED or UNDER_REVIEW)
```

## Project Structure

```
efirchain/
├── frontend/    # Next.js 14+ (App Router) + TypeScript + Tailwind CSS
├── backend/     # Node.js + Express + TypeScript
├── blockchain/  # Hardhat project for Solidity contracts
├── .gitignore
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- PostgreSQL
- Node-gyp (for bcrypt compilation on some systems)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd efirchain
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Set up environment files**
   
   Copy `.env.example` to `.env` in each sub-project and fill in the values:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   
   # Blockchain
   cp blockchain/.env.example blockchain/.env
   ```

4. **Install dependencies for each project**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../blockchain && npm install
   cd ..
   ```

## Running the Application

### Development Mode

**Option 1: Run all services together**
```bash
npm run dev
```
This starts frontend (port 3000) and backend (port 5000) concurrently.

**Option 2: Run services individually**

Terminal 1 - Frontend:
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

Terminal 2 - Backend:
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

Terminal 3 - Local Hardhat Blockchain Node:
```bash
npm run dev:blockchain
# or
cd blockchain && npx hardhat node
```

### Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE efirchain;
   ```

2. Update `backend/.env` with your database connection:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/efirchain
   ```

3. Install Prisma and run migrations (Phase 1):
   ```bash
   cd backend
   npm install @prisma/client
   npx prisma migrate dev
   ```

### Deploy Smart Contract

1. Start a local Hardhat node (in one terminal):
   ```bash
   cd blockchain
   npx hardhat node
   ```

2. Deploy the contract (in another terminal):
   ```bash
   npx hardhat deploy --network localhost
   ```

## API Endpoints

### Backend
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/firs` - Create new FIR (CITIZEN)
- `GET /api/firs` - List FIRs (scoped by role)
- `GET /api/firs/:id` - Get FIR by ID
- `PATCH /api/firs/:id/status` - Update FIR status
- `POST /api/firs/:id/evidence` - Upload evidence
- `GET /api/blockchain/verify/:firId` - Verify FIR integrity on blockchain

### Frontend
- `GET /` - Home page
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /dashboard` - User dashboard (role-specific)
- `GET /firs/:id` - FIR detail page

## Wallet Model

The backend holds **ONE controlled wallet** that signs all blockchain transactions. Citizens and officers never need a crypto wallet or pay gas.

## Security Notes

- Never commit `.env` files (they're in `.gitignore`)
- Wallet private keys should only be in environment variables
- JWT secret must be a strong, random string in production
- Passwords are hashed with bcrypt before storage

## Project Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup | ✅ Complete |
| 1 | Database Schema + Auth | 🔄 In Progress |
| 2 | FIR & Case Management APIs | Pending |
| 3 | Smart Contract + Blockchain Integration | Pending |
| 4 | Frontend | Pending |
| 5 | Testing | Pending |
| 6 | Security Hardening & Polish | Pending |
| 7 | Deployment | Pending |

## Troubleshooting

### Port already in use
If port 3000 or 5000 is already in use, update the port in the respective `package.json` scripts or environment files.

### Hardhat node not starting
Make sure no other process is using port 8545, or change the network URL in `blockchain/hardhat.config.ts`.

### bcrypt compilation errors
Install node-gyp: `npm install -g node-gyp` and ensure Python 3 is installed.

## License

MIT License