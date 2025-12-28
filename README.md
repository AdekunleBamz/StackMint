# StacksMint 💎

A decentralized NFT minting platform built on the Stacks blockchain.

## Features

- 🎨 **Easy NFT Minting** - Create NFTs with a simple interface
- 📦 **Collections** - Organize NFTs into collections
- 💰 **Marketplace** - Buy and sell NFTs
- 🔒 **Bitcoin Security** - Secured by Bitcoin via Stacks

## Tech Stack

- **Blockchain**: Stacks (Clarity smart contracts)
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Wallet**: Stacks Connect

## Smart Contracts

| Contract | Description |
|----------|-------------|
| `stacksmint-treasury` | Fee collection (0.01 STX per action) |
| `stacksmint-nft` | SIP-009 compliant NFT contract |
| `stacksmint-collection` | Collection management |
| `stacksmint-marketplace` | Buy/sell functionality |

## Getting Started

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev
```

## Deployed Contracts

All contracts deployed on Stacks mainnet:
- Contract address: `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N`

## License

MIT
