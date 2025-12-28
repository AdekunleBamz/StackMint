# StacksMint 💎

A full-stack decentralized NFT minting platform and marketplace built on the Stacks blockchain. Create, collect, and trade NFTs secured by Bitcoin.

![Stacks](https://img.shields.io/badge/Stacks-5546FF?style=flat&logo=stacks&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Overview

StacksMint is a complete NFT platform that enables users to mint NFTs, create collections, and trade on a decentralized marketplace. Built with Clarity smart contracts for secure on-chain logic and a modern Next.js frontend for seamless user experience.

## ✨ Features

- 🎨 **NFT Minting** - Mint unique NFTs with metadata and customizable properties
- 📦 **Collection Management** - Create and manage NFT collections with royalties
- 🛒 **Decentralized Marketplace** - List, buy, and sell NFTs peer-to-peer
- 💰 **Treasury System** - Transparent fee collection and platform revenue
- 🔗 **SIP-009 Compliant** - Full compatibility with Stacks NFT standard
- 🔒 **Bitcoin Security** - Transactions secured by Bitcoin's proof-of-work
- 👛 **Wallet Integration** - Seamless connection with Hiro Wallet and Leather

## 🛠 Tech Stack

### Blockchain
- **Stacks** - Layer 2 Bitcoin blockchain
- **Clarity** - Smart contract language (non-Turing complete for security)
- **SIP-009** - NFT trait standard

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Stacks.js** - Blockchain interaction library
- **Stacks Connect** - Wallet authentication

## 📜 Smart Contracts

| Contract | Description |
|----------|-------------|
| `stacksmint-treasury` | Platform fee collection and management (0.01 STX per action) |
| `stacksmint-nft` | SIP-009 compliant NFT minting contract |
| `stacksmint-collection` | Collection creation and royalty management |
| `stacksmint-marketplace` | Decentralized listing and trading functionality |
| `sip009-nft-trait` | Standard NFT trait interface |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Hiro Wallet or Leather Wallet browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stacksmint.git
cd stacksmint

# Install frontend dependencies
cd frontend
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Smart Contract Development

```bash
# Install Clarinet (Stacks development tool)
brew install clarinet

# Check contracts
clarinet check

# Run tests
clarinet test
```

## 📁 Project Structure

```
stacksmint/
├── contracts/           # Clarity smart contracts
│   ├── stacksmint-nft.clar
│   ├── stacksmint-collection.clar
│   ├── stacksmint-marketplace.clar
│   ├── stacksmint-treasury.clar
│   └── sip009-nft-trait.clar
├── frontend/            # Next.js application
│   └── src/
│       ├── app/         # App router pages
│       ├── components/  # React components
│       ├── context/     # React context providers
│       ├── hooks/       # Custom hooks
│       └── lib/         # Utilities and helpers
├── deployments/         # Deployment configurations
└── settings/            # Network configurations
```

## 🌐 Deployed Contracts

All contracts are deployed on Stacks Mainnet:

**Contract Address:** `SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N`

View on Explorer:
- [Treasury](https://explorer.stacks.co/txid/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury)
- [NFT Contract](https://explorer.stacks.co/txid/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft)
- [Collection](https://explorer.stacks.co/txid/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-collection)
- [Marketplace](https://explorer.stacks.co/txid/SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-marketplace)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
