/**
 * Stacks Integration Best Practices
 * 
 * Usage Guide for @stacks/connect and @stacks/transactions
 * 
 * @stacks/connect:
 *   - Handles wallet connections and contract interactions
 *   - Manages user authentication via Stacks wallets
 *   - Provides UI/UX for transaction confirmation
 * 
 * @stacks/transactions:
 *   - Constructs transaction objects
 *   - Handles STX transfers and contract calls
 *   - Manages nonce and fee calculations
 */

import { 
  openContractCall,
  showConnect,
  StacksProvider,
  ContractCallOptions,
} from '@stacks/connect';

import {
  makeContractCall,
  makeSTXTokenTransfer,
  PostConditionMode,
  contractPrincipalCV,
  standardPrincipalCV,
  uintCV,
  bufferCV,
  listCV,
} from '@stacks/transactions';

/**
 * Example: Connect wallet using @stacks/connect
 */
export const connectWallet = async () => {
  try {
    await showConnect({
      userSession: new StacksProvider(),
      appDetails: {
        name: 'StacksMint',
        icon: '/logo.png',
      },
      onFinish: () => {
        console.log('User connected wallet');
      },
      onCancel: () => {
        console.log('User cancelled connection');
      },
    });
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
};

/**
 * Example: Make a contract call with @stacks/transactions
 */
export const mintNFT = async (contractAddress: string, contractName: string) => {
  const tx = await makeContractCall({
    network: 'mainnet',
    contractAddress: contractAddress,
    contractName: contractName,
    functionName: 'mint',
    functionArgs: [
      bufferCV(Buffer.from('ipfs-hash')),
      standardPrincipalCV('SP1234...'),
    ],
    fee: 500,
    senderKey: '', // Should come from wallet, never embed in client
    postConditionMode: PostConditionMode.Allow,
  });

  // Send transaction through user's wallet
  return tx;
};

/**
 * Example: Transfer STX using @stacks/transactions
 */
export const transferSTX = async (
  recipientAddress: string,
  amountMicroSTX: number
) => {
  const tx = await makeSTXTokenTransfer({
    recipient: recipientAddress,
    amount: amountMicroSTX,
    fee: 500,
    nonce: 0, // Get from blockchain
    senderKey: '', // Should come from wallet
  });

  return tx;
};

/**
 * Security best practices:
 * 
 * 1. Never store private keys in client-side code
 * 2. Always use @stacks/connect for signing transactions
 * 3. Validate contract addresses before making calls
 * 4. Use proper fee estimation
 * 5. Implement post-conditions to prevent unexpected contract behavior
 * 6. Handle errors gracefully
 * 7. Verify nonce before transaction submission
 * 8. Use testnet for development
 */
