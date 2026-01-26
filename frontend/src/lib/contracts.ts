/**
 * StacksMint Contract Interactions
 * Functions for interacting with Clarity smart contracts
 * @module contracts
 * @version 2.0.0
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  bufferCV,
  noneCV,
  someCV,
  listCV,
  tupleCV,
  boolCV,
  type ClarityValue,
  cvToJSON,
  hexToCV,
  cvToHex,
  type TxBroadcastResult,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { userSession } from './stacks';

// ============================================================================
// Contract Configuration
// ============================================================================

// Transaction configuration defaults
const DEFAULT_ANCHOR_MODE = AnchorMode.Any;
const DEFAULT_POST_CONDITION_MODE = PostConditionMode.Deny;

export const CONTRACT_CONFIG = {
  mainnet: {
    address: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
    nft: 'stacksmint-nft',
    collection: 'stacksmint-collection',
    marketplace: 'stacksmint-marketplace',
    treasury: 'stacksmint-treasury',
    network: 'mainnet' as const,
    explorerUrl: 'https://explorer.stacks.co',
  },
  testnet: {
    address: 'ST3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
    nft: 'stacksmint-nft',
    collection: 'stacksmint-collection',
    marketplace: 'stacksmint-marketplace',
    treasury: 'stacksmint-treasury',
    network: 'testnet' as const,
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
  },
} as const;

export type NetworkType = keyof typeof CONTRACT_CONFIG;

// Get current network from environment or default
export function getCurrentNetwork(): NetworkType {
  const env = process.env.NEXT_PUBLIC_NETWORK;
  return env === 'testnet' ? 'testnet' : 'mainnet';
}

export function getContractConfig(network?: NetworkType) {
  return CONTRACT_CONFIG[network || getCurrentNetwork()];
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface MintParams {
  uri: string;
  collectionId?: number;
  royaltyPercent?: number;
}

export interface CreateCollectionParams {
  name: string;
  maxSupply: number;
  baseUri?: string;
  royaltyPercent?: number;
  description?: string;
}

export interface ListNFTParams {
  tokenId: number;
  price: number; // in microSTX
  expirationBlock?: number;
}

export interface TransferNFTParams {
  tokenId: number;
  recipient: string;
}

export interface BuyNFTParams {
  listingId: number;
  tokenId: number;
  price: number; // in microSTX
  seller: string;
}

export interface CancelListingParams {
  listingId: number;
}

export interface ContractCallResult {
  txId: string;
  txStatus: 'pending' | 'success' | 'failed';
  explorerUrl: string;
}

export interface NFTMetadata {
  tokenId: number;
  owner: string;
  uri: string;
  collectionId?: number;
  listed: boolean;
  price?: number;
}

// ============================================================================
// Transaction Options Builders
// ============================================================================

const defaultTxOptions = {
  postConditionMode: PostConditionMode.Allow,
  anchorMode: AnchorMode.Any,
};

/**
 * Build transaction options for minting an NFT
 */
export function buildMintNFTOptions(params: MintParams, network?: NetworkType) {
  const config = getContractConfig(network);
  
  // Validate URI
  if (!params.uri || params.uri.trim() === '') {
    throw new Error('URI is required for minting');
  }
  
  if (params.uri.length > 256) {
    throw new Error('URI must be 256 characters or less');
  }

  const functionArgs: ClarityValue[] = [stringAsciiCV(params.uri)];
  
  // Add optional collection ID
  if (params.collectionId !== undefined) {
    functionArgs.push(someCV(uintCV(params.collectionId)));
  } else {
    functionArgs.push(noneCV());
  }
  
  // Add optional royalty
  if (params.royaltyPercent !== undefined) {
    if (params.royaltyPercent < 0 || params.royaltyPercent > 25) {
      throw new Error('Royalty must be between 0 and 25 percent');
    }
    functionArgs.push(someCV(uintCV(params.royaltyPercent * 100))); // Convert to basis points
  }

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.nft,
    functionName: 'mint',
    functionArgs,
  };
}

/**
 * Build transaction options for creating a collection
 */
export function buildCreateCollectionOptions(params: CreateCollectionParams, network?: NetworkType) {
  const config = getContractConfig(network);
  
  // Validate name
  if (!params.name || params.name.trim() === '') {
    throw new Error('Collection name is required');
  }
  
  if (params.name.length > 64) {
    throw new Error('Collection name must be 64 characters or less');
  }
  
  // Validate max supply
  if (params.maxSupply < 1 || params.maxSupply > 10000) {
    throw new Error('Max supply must be between 1 and 10,000');
  }

  const functionArgs: ClarityValue[] = [
    stringAsciiCV(params.name),
    uintCV(params.maxSupply),
  ];
  
  // Add optional base URI
  if (params.baseUri) {
    functionArgs.push(someCV(stringAsciiCV(params.baseUri)));
  } else {
    functionArgs.push(noneCV());
  }
  
  // Add optional royalty
  if (params.royaltyPercent !== undefined) {
    if (params.royaltyPercent < 0 || params.royaltyPercent > 25) {
      throw new Error('Royalty must be between 0 and 25 percent');
    }
    functionArgs.push(someCV(uintCV(params.royaltyPercent * 100)));
  }

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.collection,
    functionName: 'create-collection',
    functionArgs,
  };
}

/**
 * Build transaction options for listing an NFT
 */
export function buildListNFTOptions(params: ListNFTParams, network?: NetworkType) {
  const config = getContractConfig(network);
  
  // Validate price (minimum 0.001 STX = 1000 microSTX)
  if (params.price < 1000) {
    throw new Error('Minimum listing price is 0.001 STX');
  }

  const functionArgs: ClarityValue[] = [
    uintCV(params.tokenId),
    uintCV(params.price),
  ];
  
  // Add optional expiration
  if (params.expirationBlock) {
    functionArgs.push(someCV(uintCV(params.expirationBlock)));
  }

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.marketplace,
    functionName: 'list-nft',
    functionArgs,
  };
}

/**
 * Build transaction options for buying an NFT
 */
export function buildBuyNFTOptions(params: BuyNFTParams, network?: NetworkType) {
  const config = getContractConfig(network);

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.marketplace,
    functionName: 'buy-nft',
    functionArgs: [
      uintCV(params.tokenId),
      principalCV(params.seller),
    ],
    postConditions: [
      // Add STX transfer post condition here
    ],
  };
}

/**
 * Build transaction options for transferring an NFT
 */
export function buildTransferNFTOptions(params: TransferNFTParams, network?: NetworkType) {
  const config = getContractConfig(network);
  
  // Validate recipient address
  if (!params.recipient.startsWith('SP') && !params.recipient.startsWith('ST')) {
    throw new Error('Invalid recipient address');
  }

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.nft,
    functionName: 'transfer',
    functionArgs: [
      uintCV(params.tokenId),
      principalCV(params.recipient),
    ],
  };
}

/**
 * Build transaction options for unlisting an NFT
 */
export function buildUnlistNFTOptions(tokenId: number, network?: NetworkType) {
  const config = getContractConfig(network);

  return {
    ...defaultTxOptions,
    contractAddress: config.address,
    contractName: config.marketplace,
    functionName: 'unlist-nft',
    functionArgs: [uintCV(tokenId)],
  };
}

// ============================================================================
// Read-Only Functions
// ============================================================================

/**
 * Get NFT metadata by token ID
 */
export async function getNFTMetadata(tokenId: number, network?: NetworkType): Promise<NFTMetadata | null> {
  const config = getContractConfig(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.nft,
      functionName: 'get-token-uri',
      functionArgs: [uintCV(tokenId)],
      senderAddress: config.address,
      network: config.network,
    });
    
    const json = cvToJSON(result);
    if (!json.value) return null;
    
    return {
      tokenId,
      owner: '', // Would need separate call
      uri: json.value.value || '',
      listed: false,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Get NFT owner
 */
export async function getNFTOwner(tokenId: number, network?: NetworkType): Promise<string | null> {
  const config = getContractConfig(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.nft,
      functionName: 'get-owner',
      functionArgs: [uintCV(tokenId)],
      senderAddress: config.address,
      network: config.network,
    });
    
    const json = cvToJSON(result);
    return json.value?.value || null;
  } catch (error) {
    console.error('Error fetching NFT owner:', error);
    return null;
  }
}

/**
 * Get collection info
 */
export async function getCollectionInfo(collectionId: number, network?: NetworkType) {
  const config = getContractConfig(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.collection,
      functionName: 'get-collection',
      functionArgs: [uintCV(collectionId)],
      senderAddress: config.address,
      network: config.network,
    });
    
    return cvToJSON(result);
  } catch (error) {
    console.error('Error fetching collection info:', error);
    return null;
  }
}

/**
 * Get listing info for an NFT
 */
export async function getListingInfo(tokenId: number, network?: NetworkType) {
  const config = getContractConfig(network);
  
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.marketplace,
      functionName: 'get-listing',
      functionArgs: [uintCV(tokenId)],
      senderAddress: config.address,
      network: config.network,
    });
    
    return cvToJSON(result);
  } catch (error) {
    console.error('Error fetching listing info:', error);
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get explorer URL for a transaction
 */
export function getTransactionExplorerUrl(txId: string, network?: NetworkType): string {
  const config = getContractConfig(network);
  const cleanTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  return `${config.explorerUrl}/txid/${cleanTxId}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(address: string, network?: NetworkType): string {
  const config = getContractConfig(network);
  return `${config.explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for an NFT
 */
export function getNFTExplorerUrl(tokenId: number, network?: NetworkType): string {
  const config = getContractConfig(network);
  return `${config.explorerUrl}/address/${config.address}.${config.nft}?tokenId=${tokenId}`;
}

/**
 * Convert microSTX to STX
 */
export function microSTXToSTX(microSTX: number): number {
  return microSTX / 1_000_000;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroSTX(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Format price for display
 */
export function formatPrice(microSTX: number): string {
  const stx = microSTXToSTX(microSTX);
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

// ============================================================================
// Legacy API (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use buildMintNFTOptions instead
 */
export async function mintNFT(uri: string) {
  return buildMintNFTOptions({ uri });
}

/**
 * @deprecated Use buildCreateCollectionOptions instead
 */
export async function createCollection(name: string, maxSupply: number) {
  return buildCreateCollectionOptions({ name, maxSupply });
}
