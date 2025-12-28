import UniversalProvider from '@walletconnect/universal-provider';

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Stacks mainnet chain ID in CAIP format
export const STACKS_MAINNET = 'stacks:1';

// Stacks RPC methods we need
export const STACKS_METHODS = [
  'stx_getAddresses',
  'stx_signTransaction',
  'stx_callContract',
  'stx_transferStx',
];

// App metadata for WalletConnect
const metadata = {
  name: 'StacksMint',
  description: 'Decentralized NFT minting platform on Stacks',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://stacksmint.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.svg` : 'https://stacksmint.app/logo.svg'],
};

let provider: UniversalProvider | null = null;
let isInitializing = false;

export async function getProvider(): Promise<UniversalProvider> {
  if (provider) return provider;
  
  if (isInitializing) {
    // Wait for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getProvider();
  }
  
  isInitializing = true;
  
  try {
    provider = await UniversalProvider.init({
      projectId: PROJECT_ID,
      metadata,
      relayUrl: 'wss://relay.walletconnect.org',
    });
    
    // Handle session events
    provider.on('session_delete', () => {
      console.log('WalletConnect session deleted');
      provider = null;
    });
    
    return provider;
  } finally {
    isInitializing = false;
  }
}

export interface WCConnectResult {
  address: string;
  session: any;
}

export async function wcConnect(
  onDisplayUri: (uri: string) => void
): Promise<WCConnectResult> {
  const provider = await getProvider();
  
  // Subscribe to display_uri event BEFORE connecting
  provider.on('display_uri', (uri: string) => {
    console.log('WalletConnect URI:', uri);
    onDisplayUri(uri);
  });
  
  // Connect with required Stacks namespaces
  const session = await provider.connect({
    namespaces: {
      stacks: {
        chains: [STACKS_MAINNET],
        methods: STACKS_METHODS,
        events: [],
      },
    },
  });
  
  if (!session) {
    throw new Error('Failed to establish WalletConnect session');
  }
  
  // Get addresses from wallet
  let address: string | null = null;
  
  try {
    // Try to get address via stx_getAddresses with timeout
    const addressPromise = provider.request<{ addresses: Array<{ address: string; symbol: string }> }>({
      method: 'stx_getAddresses',
      params: {},
    }, STACKS_MAINNET);
    
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('stx_getAddresses timeout')), 15000)
    );
    
    const result = await Promise.race([addressPromise, timeoutPromise]);
    
    if (result && result.addresses) {
      // Find STX address
      const stxAddress = result.addresses.find((a) => a.symbol === 'STX');
      address = stxAddress?.address || result.addresses[0]?.address || null;
    }
  } catch (error) {
    console.warn('stx_getAddresses failed, falling back to session accounts:', error);
  }
  
  // Fallback: parse address from session accounts
  if (!address && session.namespaces.stacks?.accounts?.[0]) {
    // Format: stacks:1:SP...
    const accountParts = session.namespaces.stacks.accounts[0].split(':');
    address = accountParts[2] || null;
  }
  
  if (!address) {
    throw new Error('Could not get Stacks address from wallet');
  }
  
  return { address, session };
}

export async function wcDisconnect(): Promise<void> {
  if (!provider) return;
  
  try {
    await provider.disconnect();
  } catch (error) {
    console.error('Error disconnecting WalletConnect:', error);
  } finally {
    provider = null;
  }
}

export async function wcSignTransaction(txHex: string): Promise<string> {
  const provider = await getProvider();
  
  const result = await provider.request<{ transaction: string } | string>({
    method: 'stx_signTransaction',
    params: {
      transaction: txHex,
      broadcast: true,
    },
  }, STACKS_MAINNET);
  
  // Handle different response formats from wallets
  if (typeof result === 'string') {
    return result;
  }
  
  return result.transaction;
}

export async function wcCallContract(params: {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: string[];
  postConditions?: string[];
}): Promise<string> {
  const provider = await getProvider();
  
  const result = await provider.request<{ txId: string } | string>({
    method: 'stx_callContract',
    params: {
      ...params,
      network: 'mainnet',
      broadcast: true,
    },
  }, STACKS_MAINNET);
  
  if (typeof result === 'string') {
    return result;
  }
  
  return result.txId;
}

export async function wcTransferStx(params: {
  recipient: string;
  amount: string;
  memo?: string;
}): Promise<string> {
  const provider = await getProvider();
  
  const result = await provider.request<{ txId: string } | string>({
    method: 'stx_transferStx',
    params: {
      ...params,
      network: 'mainnet',
    },
  }, STACKS_MAINNET);
  
  if (typeof result === 'string') {
    return result;
  }
  
  return result.txId;
}

export function isWCConnected(): boolean {
  return provider?.session !== null && provider?.session !== undefined;
}

export function getWCSession() {
  return provider?.session || null;
}
