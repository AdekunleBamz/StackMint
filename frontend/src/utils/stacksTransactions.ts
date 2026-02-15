/**
 * Stacks Transaction Utilities
 * 
 * Helper functions for building and managing Stacks transactions
 */

import {
  makeContractCall,
  makeSTXTokenTransfer,
  NonFungibleConditionCode,
  FungibleConditionCode,
  nonfungiblePostCondition,
  fungiblePostCondition,
  PostConditionMode,
} from '@stacks/transactions';
import { getNetwork, getContractAddress } from '@/config/stacks.config';

/**
 * Build an NFT minting transaction
 */
export const buildMintNFTTransaction = async (
  tokenName: string,
  tokenUri: string,
  senderAddress: string,
  fee: number = 200
) => {
  const contractAddress = getContractAddress('nft');
  
  return makeContractCall({
    contractAddress,
    contractName: 'stacksmint-nft',
    functionName: 'mint',
    functionArgs: [tokenName, tokenUri],
    senderAddress,
    network: getNetwork(),
    fee,
    postConditionMode: PostConditionMode.Deny,
    postConditions: [],
  });
};

/**
 * Build an NFT transfer transaction
 */
export const buildTransferNFTTransaction = async (
  nftId: string,
  recipient: string,
  senderAddress: string,
  fee: number = 200
) => {
  const contractAddress = getContractAddress('nft');
  
  return makeContractCall({
    contractAddress,
    contractName: 'stacksmint-nft',
    functionName: 'transfer',
    functionArgs: [nftId, recipient],
    senderAddress,
    network: getNetwork(),
    fee,
  });
};

/**
 * Build an NFT listing transaction for marketplace
 */
export const buildListNFTTransaction = async (
  nftId: string,
  price: number,
  senderAddress: string,
  fee: number = 200
) => {
  const marketplaceAddress = getContractAddress('marketplace');
  
  return makeContractCall({
    contractAddress: marketplaceAddress,
    contractName: 'stacksmint-marketplace',
    functionName: 'list-in-ustx',
    functionArgs: [nftId, price],
    senderAddress,
    network: getNetwork(),
    fee,
  });
};

/**
 * Build a purchase transaction for marketplace listing
 */
export const buildPurchaseNFTTransaction = async (
  listingId: string,
  price: number,
  senderAddress: string,
  fee: number = 200
) => {
  const marketplaceAddress = getContractAddress('marketplace');
  
  return makeContractCall({
    contractAddress: marketplaceAddress,
    contractName: 'stacksmint-marketplace',
    functionName: 'buy-in-ustx',
    functionArgs: [listingId],
    senderAddress,
    network: getNetwork(),
    fee,
    postConditions: [
      fungiblePostCondition(
        senderAddress,
        FungibleConditionCode.LessEqual,
        price.toString(),
        'SP1234567890.ustx'
      ),
    ],
  });
};

/**
 * Build an STX transfer transaction
 */
export const buildSTXTransferTransaction = async (
  recipient: string,
  amount: number,
  senderAddress: string,
  fee: number = 200
) => {
  return makeSTXTokenTransfer({
    recipient,
    amount: amount.toString(),
    senderAddress,
    network: getNetwork(),
    fee,
  });
};

/**
 * Estimate transaction fee based on complexity
 */
export const estimateTransactionFee = (
  transactionType: 'transfer' | 'mint' | 'list' | 'purchase'
): number => {
  const feeMap = {
    transfer: 200,
    mint: 300,
    list: 250,
    purchase: 300,
  };
  
  return feeMap[transactionType];
};

/**
 * Validate Stacks address format
 */
export const isValidStacksAddress = (address: string): boolean => {
  // Mainnet addresses start with 'SP', testnet with 'ST'
  const stacksAddressRegex = /^(SP|ST)[123456789A-HJ-NP-Z]{32}$/;
  return stacksAddressRegex.test(address);
};

/**
 * Convert microSTX to STX
 */
export const microSTXToSTX = (microSTX: number): number => {
  return microSTX / 1_000_000;
};

/**
 * Convert STX to microSTX
 */
export const stxToMicroSTX = (stx: number): number => {
  return stx * 1_000_000;
};

/**
 * Format STX amount for display
 */
export const formatSTX = (microSTX: number, decimals: number = 2): string => {
  return microSTXToSTX(microSTX).toFixed(decimals) + ' STX';
};
