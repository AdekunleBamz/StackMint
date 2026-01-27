/**
 * StacksMint API Client
 * Handles all API interactions with backend and blockchain
 * @module api
 * @version 1.0.0
 */

import { NETWORKS, DEFAULT_NETWORK, IPFS } from './constants';

// ============================================================================
// Types
// ============================================================================

export interface NFTMetadata {
  id: number;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  banner?: string;
  creator: string;
  contractAddress: string;
  totalSupply: number;
  maxSupply: number;
  floorPrice?: number;
  volume24h?: number;
  verified: boolean;
  createdAt: number;
}

export interface Listing {
  id: string;
  nftId: number;
  seller: string;
  price: number;
  collectionId: string;
  createdAt: number;
  expiresAt?: number;
}

export interface Transaction {
  txId: string;
  type: 'mint' | 'transfer' | 'list' | 'buy' | 'cancel';
  from: string;
  to?: string;
  nftId: number;
  price?: number;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// API Client Configuration
// ============================================================================

type NetworkType = keyof typeof NETWORKS;

class APIClient {
  private baseUrl: string;
  private network: NetworkType;

  constructor(network: NetworkType = DEFAULT_NETWORK as NetworkType) {
    this.network = network;
    this.baseUrl = NETWORKS[network].url;
  }

  setNetwork(network: NetworkType) {
    this.network = network;
    this.baseUrl = NETWORKS[network].url;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new APIError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError('Network error. Please check your connection.', 0);
    }
  }

  // ============================================================================
  // Account Endpoints
  // ============================================================================

  async getAccountBalance(address: string): Promise<{ stx: number; fungible_tokens: Record<string, any> }> {
    return this.fetch(`/extended/v1/address/${address}/balances`);
  }

  async getAccountNFTs(address: string, page = 0, limit = 50): Promise<any> {
    return this.fetch(`/extended/v1/address/${address}/nft_events?limit=${limit}&offset=${page * limit}`);
  }

  async getAccountTransactions(address: string, page = 0, limit = 20): Promise<any> {
    return this.fetch(`/extended/v1/address/${address}/transactions?limit=${limit}&offset=${page * limit}`);
  }

  // ============================================================================
  // Transaction Endpoints
  // ============================================================================

  async getTransaction(txId: string): Promise<any> {
    return this.fetch(`/extended/v1/tx/${txId}`);
  }

  async getTransactionStatus(txId: string): Promise<'pending' | 'success' | 'failed'> {
    const tx = await this.getTransaction(txId);
    if (tx.tx_status === 'success') return 'success';
    if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') return 'failed';
    return 'pending';
  }

  // ============================================================================
  // Contract Endpoints
  // ============================================================================

  async callReadOnlyFunction(
    contractAddress: string,
    contractName: string,
    functionName: string,
    args: string[] = []
  ): Promise<any> {
    return this.fetch(`/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`, {
      method: 'POST',
      body: JSON.stringify({
        sender: contractAddress,
        arguments: args,
      }),
    });
  }

  // ============================================================================
  // NFT Metadata
  // ============================================================================

  async fetchNFTMetadata(uri: string): Promise<NFTMetadata | null> {
    try {
      // Convert IPFS URI if necessary
      let fetchUrl = uri;
      if (uri.startsWith('ipfs://')) {
        fetchUrl = uri.replace('ipfs://', IPFS.defaultGateway);
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) return null;
      
      return response.json();
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const api = new APIClient();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format microSTX to STX for display
 */
export function formatBalance(microSTX: number): string {
  const stx = microSTX / 1_000_000;
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(txId: string, network: NetworkType = DEFAULT_NETWORK as NetworkType): string {
  return `${NETWORKS[network].explorerUrl}/txid/${txId}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressExplorerUrl(address: string, network: NetworkType = DEFAULT_NETWORK as NetworkType): string {
  return `${NETWORKS[network].explorerUrl}/address/${address}`;
}