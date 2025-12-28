export const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export const CONTRACTS = {
  NFT: 'stacksmint-nft',
  TREASURY: 'stacksmint-treasury',
  COLLECTION: 'stacksmint-collection',
  MARKETPLACE: 'stacksmint-marketplace',
} as const;

export const CREATOR_FEE = 10000; // 0.01 STX in microSTX
export const CREATOR_FEE_STX = 0.01;

export const NETWORK = 'mainnet';

export const API_BASE = 'https://api.mainnet.hiro.so';

export const EXPLORER_BASE = 'https://explorer.stacks.co';

export function getExplorerUrl(txId: string): string {
  return `${EXPLORER_BASE}/txid/${txId}?chain=${NETWORK}`;
}

export function getAddressExplorerUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}?chain=${NETWORK}`;
}
