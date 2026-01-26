/**
 * Stacks API Client
 * Provides functions to interact with the Hiro Stacks API
 * @module api
 * @version 2.2.0
 */

type NetworkType = 'mainnet' | 'testnet';

// API rate limiting configuration
const RATE_LIMIT_MS = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
let lastRequestTime = 0;

const API_ENDPOINTS: Record<NetworkType, string> = {
  mainnet: 'https://api.mainnet.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
};

// Request timeout configuration
const DEFAULT_TIMEOUT_MS = 30000;

// Default to mainnet, can be configured
let currentNetwork: NetworkType = 'mainnet';

/**
 * Set the network for API calls
 */
export function setNetwork(network: NetworkType): void {
  currentNetwork = network;
}

/**
 * Get the current network
 */
export function getNetwork(): NetworkType {
  return currentNetwork;
}

/**
 * Get the API base URL for the current network
 */
function getApiBase(): string {
  return API_ENDPOINTS[currentNetwork];
}

/**
 * Generic fetch wrapper with error handling and retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * NFT Response Types
 */
interface NFTHolding {
  asset_identifier: string;
  value: {
    hex: string;
    repr: string;
  };
  block_height: number;
  tx_id: string;
}

interface NFTHoldingsResponse {
  limit: number;
  offset: number;
  total: number;
  results: NFTHolding[];
}

/**
 * Fetch NFTs owned by an address
 */
export async function fetchNFTs(
  address: string,
  options?: { limit?: number; offset?: number }
): Promise<NFTHoldingsResponse> {
  const { limit = 50, offset = 0 } = options || {};
  const url = `${getApiBase()}/extended/v1/tokens/nft/holdings?principal=${address}&limit=${limit}&offset=${offset}`;
  return fetchWithRetry<NFTHoldingsResponse>(url);
}

/**
 * Fetch all NFTs (handles pagination)
 */
export async function fetchAllNFTs(address: string): Promise<NFTHolding[]> {
  const allNFTs: NFTHolding[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const response = await fetchNFTs(address, { limit, offset });
    allNFTs.push(...response.results);

    if (allNFTs.length >= response.total) {
      break;
    }
    offset += limit;
  }

  return allNFTs;
}

/**
 * Balance Response Type
 */
interface STXBalanceResponse {
  balance: string;
  total_sent: string;
  total_received: string;
  locked: string;
  lock_tx_id: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}

/**
 * Fetch STX balance for an address
 */
export async function fetchSTXBalance(address: string): Promise<STXBalanceResponse> {
  const url = `${getApiBase()}/extended/v1/address/${address}/stx`;
  return fetchWithRetry<STXBalanceResponse>(url);
}

/**
 * Fetch formatted STX balance (in STX, not microSTX)
 */
export async function fetchFormattedSTXBalance(address: string): Promise<{
  balance: number;
  locked: number;
  formatted: string;
}> {
  const data = await fetchSTXBalance(address);
  const balance = parseInt(data.balance) / 1_000_000;
  const locked = parseInt(data.locked) / 1_000_000;
  
  return {
    balance,
    locked,
    formatted: balance.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    }),
  };
}

/**
 * Transaction Response Types
 */
interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  block_hash: string;
  burn_block_time: number;
  sender_address: string;
  fee_rate: string;
  nonce: number;
}

interface TransactionsResponse {
  limit: number;
  offset: number;
  total: number;
  results: Transaction[];
}

/**
 * Fetch transactions for an address
 */
export async function fetchTransactions(
  address: string,
  options?: { limit?: number; offset?: number; type?: string }
): Promise<TransactionsResponse> {
  const { limit = 20, offset = 0, type } = options || {};
  let url = `${getApiBase()}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`;
  
  if (type) {
    url += `&type=${type}`;
  }
  
  return fetchWithRetry<TransactionsResponse>(url);
}

/**
 * Fetch a specific transaction by ID
 */
export async function fetchTransaction(txId: string): Promise<Transaction> {
  const url = `${getApiBase()}/extended/v1/tx/${txId}`;
  return fetchWithRetry<Transaction>(url);
}

/**
 * Get explorer URL for an address or transaction
 */
export function getExplorerUrl(
  identifier: string, 
  type: 'address' | 'tx' = 'address'
): string {
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.stacks.co'
    : 'https://explorer.stacks.co/?chain=testnet';
  
  if (type === 'tx') {
    return `${baseUrl}/txid/${identifier}`;
  }
  return `${baseUrl}/address/${identifier}`;
}

/**
 * Check if the API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBase()}/v2/info`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
