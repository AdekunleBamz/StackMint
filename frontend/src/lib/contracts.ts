import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
} from '@stacks/transactions';
import { userSession } from './stacks';

const CONTRACT_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const NETWORK = 'mainnet';

export async function mintNFT(uri: string) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'stacksmint-nft',
    functionName: 'mint',
    functionArgs: [stringAsciiCV(uri)],
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
  };
  
  return txOptions;
}

export async function createCollection(name: string, maxSupply: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: 'stacksmint-collection',
    functionName: 'create-collection',
    functionArgs: [stringAsciiCV(name), uintCV(maxSupply)],
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
  };
  
  return txOptions;
}
