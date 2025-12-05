# PlantQuest - Plant Challenge Encrypted Record DApp

Plant Challenge DApp using FHEVM fully homomorphic encryption technology (Dark/Cyberpunk style).

## Project Structure

```
action/
├── contracts/     # Smart Contracts (Hardhat + FHEVM)
└── frontend/      # Frontend Application (React + Vite + FHEVM SDK)
```

## Quick Start

### 1. Start Hardhat Node (FHEVM)

In the `contracts` directory:

```bash
cd contracts
npx hardhat node --verbose
```

This will start a local Hardhat node with FHEVM support (port 8545).

### 2. Deploy Contract

In another terminal, also in the `contracts` directory:

```bash
npx hardhat run scripts/deploy-simple.ts --network localhost
```

### 3. Generate ABI

In the `frontend` directory:

```bash
cd ../frontend
npm run genabi
```

This will generate contract ABI and address mapping from deployment information.

### 4. Start Frontend

```bash
npm run dev:mock
```

The frontend will start at `http://localhost:3000`.

## Tech Stack

### Contract Layer
- Hardhat
- @fhevm/solidity ^0.9.1
- @fhevm/hardhat-plugin ^0.3.0-1
- @fhevm/mock-utils 0.3.0-3

### Frontend Layer
- React + Vite
- Tailwind CSS (Dark/Cyberpunk theme)
- @zama-fhe/relayer-sdk 0.3.0-5
- @fhevm/mock-utils 0.3.0-1
- ethers.js ^6.15.0

## UI Design

- **Style**: Dark/Cyberpunk theme
- **Color Scheme**: Purple, blue, cyan neon effects
- **Effects**: Glow effects, scan lines, gradient borders

## Notes

1. **Local Run**: Use `dev:mock` mode, Hardhat node needs to be started first
2. **Testnet Run**: Use `dev` mode, Sepolia network configuration required
3. **Dependency Versions**: Ensure correct FHEVM versions to avoid dependency conflicts
