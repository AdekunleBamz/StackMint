/**
 * Stacks Network Configuration
 * 
 * Configuration for different Stacks networks and related settings
 */

import { StacksNetwork, StacksMainnet, StacksTestnet } from '@stacks/network';
import { Network } from '@stacks/network';

export const STACKS_NETWORKS = {
  mainnet: new StacksMainnet(),
  testnet: new StacksTestnet(),
} as const;

export type NetworkType = keyof typeof STACKS_NETWORKS;

/**
 * Get network configuration based on environment
 */
export const getNetwork = (): StacksNetwork => {
  const env = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  
  if (env === 'mainnet') {
    return STACKS_NETWORKS.mainnet;
  }
  
  return STACKS_NETWORKS.testnet;
};

/**
 * Stacks contract addresses for different networks
 */
export const STACKS_CONTRACTS = {
  mainnet: {
    nft: 'SP1234...', // NFT contract on mainnet
    marketplace: 'SP5678...', // Marketplace contract
    treasury: 'SP9ABC...', // Treasury contract
  },
  testnet: {
    nft: 'ST1234...', // NFT contract on testnet
    marketplace: 'ST5678...', // Marketplace contract
    treasury: 'ST9ABC...', // Treasury contract
  },
} as const;

/**
 * Get contract address for current network
 */
export const getContractAddress = (contractType: 'nft' | 'marketplace' | 'treasury') => {
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  const contracts = STACKS_CONTRACTS[network as NetworkType];
  
  return contracts[contractType];
};

/**
 * Stacks API URLs for different networks
 */
export const STACKS_API_URLS = {
  mainnet: 'https://stacks-node-api.mainnet.stacks.co',
  testnet: 'https://stacks-node-api.testnet.stacks.co',
} as const;

/**
 * Get API URL for current network
 */
export const getApiUrl = () => {
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return STACKS_API_URLS[network as NetworkType];
};
