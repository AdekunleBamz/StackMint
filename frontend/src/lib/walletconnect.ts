/**
 * WalletConnect Integration
 * Provides WalletConnect v2 support for Stacks wallets
 * @module walletconnect
 * @version 2.0.0
 */

import UniversalProvider from '@walletconnect/universal-provider';

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Session timeout configuration
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const CONNECTION_TIMEOUT_MS = 30 * 1000; // 30 seconds

// Stacks chain IDs in CAIP-2 format
export const STACKS_CHAINS = {
  mainnet: 'stacks:1',
  testnet: 'stacks:2147483648', // Testnet chain ID
} as const;

export type StacksChain = keyof typeof STACKS_CHAINS;

// Default to mainnet
export const STACKS_MAINNET = STACKS_CHAINS.mainnet;

// Stacks RPC methods
export const STACKS_METHODS = [
  'stx_getAddresses',
  'stx_signTransaction',
  'stx_callContract',
  'stx_transferStx',
  'stx_signMessage',
  'stx_deployContract',
] as const;

// Stacks events
export const STACKS_EVENTS = [
  'accountsChanged',
  'chainChanged',
] as const;

// App metadata for WalletConnect
const metadata = {
  name: 'StacksMint',
  description: 'Decentralized NFT minting platform on Stacks blockchain',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://stacksmint.io',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.svg` : 'https://stacksmint.io/logo.svg'],
};

// ============================================================================
// Types
// ============================================================================

export interface WCConnectResult {
  address: string;
  session: WCSession;
  network: StacksChain;
}

export interface WCSession {
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  namespaces: {
    stacks?: {
      accounts: string[];
      methods: string[];
      events: string[];
    };
  };
  expiry: number;
}

export interface WCConnectionOptions {
  network?: StacksChain;
  onDisplayUri?: (uri: string) => void;
  onSessionUpdate?: (session: WCSession) => void;
  onDisconnect?: () => void;
  timeout?: number;
}

export interface WCContractCallParams {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
  postConditions?: string[];
  network?: StacksChain;
  sponsored?: boolean;
}

export interface WCTransferParams {
  recipient: string;
  amount: string; // in microSTX as string
  memo?: string;
  network?: StacksChain;
}

export interface WCSignMessageParams {
  message: string;
  domain?: string;
}

export interface WCSignMessageResult {
  signature: string;
  publicKey: string;
}

// ============================================================================
// Provider Management
// ============================================================================

// Provider state
let provider: UniversalProvider | null = null;
let isInitializing = false;
let initPromise: Promise<UniversalProvider> | null = null;
let currentNetwork: StacksChain = 'mainnet';

// Provider state types
type ProviderState = 'uninitialized' | 'initializing' | 'ready' | 'error';
let providerState: ProviderState = 'uninitialized';

/**
 * Check if WalletConnect project ID is configured
 */
export function isWCConfigured(): boolean {
  return PROJECT_ID.length > 0;
}

/**
 * Get or initialize the WalletConnect provider
 */
export async function getProvider(): Promise<UniversalProvider> {
  // Return existing provider
  if (provider && provider.client) return provider;
  
  // Wait for ongoing initialization
  if (isInitializing && initPromise) {
    return initPromise;
  }
  
  isInitializing = true;
  
  initPromise = (async () => {
    try {
      if (!isWCConfigured()) {
        throw new Error('WalletConnect project ID is not configured');
      }

      provider = await UniversalProvider.init({
        projectId: PROJECT_ID,
        metadata,
        relayUrl: 'wss://relay.walletconnect.org',
      });
      
      // Set up event handlers
      setupProviderEvents(provider);
      
      return provider;
    } catch (error) {
      provider = null;
      throw error;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  })();
  
  return initPromise;
}

/**
 * Set up provider event handlers
 */
function setupProviderEvents(p: UniversalProvider): void {
  p.on('session_delete', () => {
    console.log('[WalletConnect] Session deleted');
    provider = null;
    notifyDisconnect();
  });

  p.on('session_expire', () => {
    console.log('[WalletConnect] Session expired');
    provider = null;
    notifyDisconnect();
  });

  p.on('session_update', (session: any) => {
    console.log('[WalletConnect] Session updated');
    sessionUpdateCallbacks.forEach(cb => cb(session));
  });
}

// Callback management
const disconnectCallbacks: Set<() => void> = new Set();
const sessionUpdateCallbacks: Set<(session: WCSession) => void> = new Set();

function notifyDisconnect(): void {
  disconnectCallbacks.forEach(cb => cb());
}

/**
 * Subscribe to disconnect events
 */
export function onWCDisconnect(callback: () => void): () => void {
  disconnectCallbacks.add(callback);
  return () => disconnectCallbacks.delete(callback);
}

/**
 * Subscribe to session update events
 */
export function onWCSessionUpdate(callback: (session: WCSession) => void): () => void {
  sessionUpdateCallbacks.add(callback);
  return () => sessionUpdateCallbacks.delete(callback);
}

// ============================================================================
// Connection Functions
// ============================================================================

/**
 * Connect via WalletConnect with enhanced options
 */
export async function wcConnect(
  options: WCConnectionOptions | ((uri: string) => void)
): Promise<WCConnectResult> {
  // Support legacy callback syntax
  const opts: WCConnectionOptions = typeof options === 'function' 
    ? { onDisplayUri: options } 
    : options;

  const network = opts.network || 'mainnet';
  const chainId = STACKS_CHAINS[network];
  const timeout = opts.timeout || 60000; // 60 second default timeout
  
  const p = await getProvider();
  
  // Register callbacks
  if (opts.onDisconnect) {
    disconnectCallbacks.add(opts.onDisconnect);
  }
  if (opts.onSessionUpdate) {
    sessionUpdateCallbacks.add(opts.onSessionUpdate);
  }
  
  // Subscribe to display_uri event BEFORE connecting
  if (opts.onDisplayUri) {
    p.on('display_uri', opts.onDisplayUri);
  }
  
  // Create connection promise with timeout
  const connectPromise = p.connect({
    namespaces: {
      stacks: {
        chains: [chainId],
        methods: [...STACKS_METHODS],
        events: [...STACKS_EVENTS],
      },
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout')), timeout);
  });

  const session = await Promise.race([connectPromise, timeoutPromise]);
  
  if (!session) {
    throw new Error('Failed to establish WalletConnect session');
  }
  
  // Get address from session
  const address = await extractAddressFromSession(p, session, chainId);
  
  if (!address) {
    await wcDisconnect();
    throw new Error('Could not get Stacks address from wallet');
  }
  
  // Store connection info
  currentNetwork = network;
  saveConnectionToStorage(address, network);
  
  return { 
    address, 
    session: session as WCSession,
    network,
  };
}

/**
 * Extract address from session with multiple fallback methods
 */
async function extractAddressFromSession(
  p: UniversalProvider,
  session: any,
  chainId: string
): Promise<string | null> {
  let address: string | null = null;
  
  // Method 1: Try stx_getAddresses RPC call
  try {
    const result = await Promise.race([
      p.request<{ addresses: Array<{ address: string; symbol: string }> }>({
        method: 'stx_getAddresses',
        params: {},
      }, chainId),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      ),
    ]);
    
    if (result && result.addresses) {
      const stxAddress = result.addresses.find(a => a.symbol === 'STX');
      address = stxAddress?.address || result.addresses[0]?.address || null;
    }
  } catch (error) {
    console.warn('[WalletConnect] stx_getAddresses failed:', error);
  }
  
  // Method 2: Parse from session accounts
  if (!address) {
    const accounts = session.namespaces?.stacks?.accounts || [];
    if (accounts.length > 0) {
      // Format: stacks:1:SP... or stacks:2147483648:ST...
      const parts = accounts[0].split(':');
      address = parts[2] || null;
    }
  }
  
  return address;
}

/**
 * Disconnect WalletConnect session
 */
export async function wcDisconnect(): Promise<void> {
  if (!provider) return;
  
  try {
    await provider.disconnect();
  } catch (error) {
    console.error('[WalletConnect] Disconnect error:', error);
  } finally {
    provider = null;
    clearConnectionStorage();
  }
}

/**
 * Restore previous session if available
 */
export async function wcRestoreSession(): Promise<WCConnectResult | null> {
  try {
    const stored = getStoredConnection();
    if (!stored) return null;
    
    const p = await getProvider();
    
    if (!p.session) return null;
    
    // Verify session is still valid
    const session = p.session as WCSession;
    if (session.expiry && session.expiry * 1000 < Date.now()) {
      clearConnectionStorage();
      return null;
    }
    
    return {
      address: stored.address,
      session,
      network: stored.network,
    };
  } catch (error) {
    console.error('[WalletConnect] Restore session error:', error);
    clearConnectionStorage();
    return null;
  }
}

// ============================================================================
// Transaction Functions
// ============================================================================

/**
 * Sign and optionally broadcast a transaction
 */
export async function wcSignTransaction(
  txHex: string,
  options?: { broadcast?: boolean; network?: StacksChain }
): Promise<string> {
  const p = await getProvider();
  const chainId = STACKS_CHAINS[options?.network || currentNetwork];
  
  const result = await p.request<{ transaction: string } | string>({
    method: 'stx_signTransaction',
    params: {
      transaction: txHex,
      broadcast: options?.broadcast ?? true,
    },
  }, chainId);
  
  return typeof result === 'string' ? result : result.transaction;
}

/**
 * Call a contract function
 */
export async function wcCallContract(params: WCContractCallParams): Promise<string> {
  const p = await getProvider();
  const chainId = STACKS_CHAINS[params.network || currentNetwork];
  
  // Validate contract address format
  if (!params.contractAddress.startsWith('SP') && !params.contractAddress.startsWith('ST')) {
    throw new Error('Invalid contract address format');
  }
  
  const result = await p.request<{ txId: string } | string>({
    method: 'stx_callContract',
    params: {
      contractAddress: params.contractAddress,
      contractName: params.contractName,
      functionName: params.functionName,
      functionArgs: params.functionArgs,
      postConditions: params.postConditions || [],
      network: params.network === 'testnet' ? 'testnet' : 'mainnet',
      broadcast: true,
      sponsored: params.sponsored || false,
    },
  }, chainId);
  
  return typeof result === 'string' ? result : result.txId;
}

/**
 * Transfer STX
 */
export async function wcTransferStx(params: WCTransferParams): Promise<string> {
  const p = await getProvider();
  const chainId = STACKS_CHAINS[params.network || currentNetwork];
  
  // Validate recipient
  if (!params.recipient.startsWith('SP') && !params.recipient.startsWith('ST')) {
    throw new Error('Invalid recipient address');
  }
  
  // Validate amount
  const amount = BigInt(params.amount);
  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0');
  }
  
  const result = await p.request<{ txId: string } | string>({
    method: 'stx_transferStx',
    params: {
      recipient: params.recipient,
      amount: params.amount,
      memo: params.memo,
      network: params.network === 'testnet' ? 'testnet' : 'mainnet',
    },
  }, chainId);
  
  return typeof result === 'string' ? result : result.txId;
}

/**
 * Sign a message
 */
export async function wcSignMessage(params: WCSignMessageParams): Promise<WCSignMessageResult> {
  const p = await getProvider();
  const chainId = STACKS_CHAINS[currentNetwork];
  
  if (!params.message || params.message.trim() === '') {
    throw new Error('Message is required');
  }
  
  const result = await p.request<WCSignMessageResult>({
    method: 'stx_signMessage',
    params: {
      message: params.message,
      domain: params.domain,
    },
  }, chainId);
  
  return result;
}

// ============================================================================
// State Functions
// ============================================================================

/**
 * Check if WalletConnect is connected
 */
export function isWCConnected(): boolean {
  return provider?.session !== null && provider?.session !== undefined;
}

/**
 * Get current WalletConnect session
 */
export function getWCSession(): WCSession | null {
  return provider?.session as WCSession | null;
}

/**
 * Get current network
 */
export function getWCNetwork(): StacksChain {
  return currentNetwork;
}

/**
 * Get connected wallet info
 */
export function getWCWalletInfo(): { name: string; icon: string } | null {
  const session = getWCSession();
  if (!session?.peer?.metadata) return null;
  
  return {
    name: session.peer.metadata.name,
    icon: session.peer.metadata.icons[0] || '',
  };
}

/**
 * Get session expiry time
 */
export function getWCSessionExpiry(): Date | null {
  const session = getWCSession();
  if (!session?.expiry) return null;
  
  return new Date(session.expiry * 1000);
}

/**
 * Check if session is expiring soon (within given minutes)
 */
export function isWCSessionExpiringSoon(withinMinutes = 30): boolean {
  const expiry = getWCSessionExpiry();
  if (!expiry) return false;
  
  const now = Date.now();
  const expiryTime = expiry.getTime();
  const threshold = withinMinutes * 60 * 1000;
  
  return expiryTime - now < threshold;
}

// ============================================================================
// Storage Helpers
// ============================================================================

const STORAGE_KEY = 'stacksmint_wc_connection';

interface StoredConnection {
  address: string;
  network: StacksChain;
  connectedAt: number;
}

function saveConnectionToStorage(address: string, network: StacksChain): void {
  if (typeof window === 'undefined') return;
  
  const data: StoredConnection = {
    address,
    network,
    connectedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStoredConnection(): StoredConnection | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function clearConnectionStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// QR Code Helpers
// ============================================================================

/**
 * Generate a mobile deep link for WalletConnect URI
 */
export function getWCMobileLink(uri: string, walletId: 'leather' | 'xverse' = 'leather'): string {
  const encodedUri = encodeURIComponent(uri);
  
  switch (walletId) {
    case 'leather':
      return `https://leather.io/wc?uri=${encodedUri}`;
    case 'xverse':
      return `https://www.xverse.app/wc?uri=${encodedUri}`;
    default:
      return uri;
  }
}

/**
 * Get wallet download links
 */
export function getWalletDownloadLinks() {
  return {
    leather: {
      ios: 'https://apps.apple.com/app/leather-bitcoin-wallet/id6451313961',
      android: 'https://play.google.com/store/apps/details?id=io.leather.wallet',
      chrome: 'https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj',
    },
    xverse: {
      ios: 'https://apps.apple.com/app/xverse-bitcoin-wallet/id1552272513',
      android: 'https://play.google.com/store/apps/details?id=com.xversebitcoinwallet',
      chrome: 'https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
    },
  };
}
