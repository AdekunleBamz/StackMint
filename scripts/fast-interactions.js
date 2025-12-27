const {
  makeContractCall,
  AnchorMode,
  broadcastTransaction,
  stringAsciiCV,
  uintCV,
  PostConditionMode,
  Pc,
} = require('@stacks/transactions');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');
require('dotenv').config({ quiet: true });

// Configuration
const MAINNET_VERSION = 22;
const API_URL = 'https://api.mainnet.hiro.so';
const CONTRACT_OWNER = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
const CREATOR_FEE = 10000; // 0.01 STX in microSTX

// Sample NFT metadata URIs
const NFT_URIS = [
  'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1',
  'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/2',
  'ipfs://QmZiMqV4DWYY7xgCRNyoF8BW5vCHkGR9dCLbH3TpzCQwgb/3',
  'ar://abc123def456_artwork_genesis',
  'ar://xyz789ghi012_digital_collectible',
  'https://stacksmint.io/nft/meta/001.json',
  'https://stacksmint.io/nft/meta/002.json',
];

const COLLECTION_NAMES = [
  'Genesis Drop', 'Digital Dreams', 'Crypto Art Vol 1', 'Abstract Visions',
  'Pixel Warriors', 'Neon Nights', 'Future Relics', 'Meta Moments',
];

const COLLECTION_DESCRIPTIONS = [
  'A unique collection of digital artwork',
  'Exploring the boundaries of digital creativity',
  'Limited edition collectibles on Stacks',
];

// Helpers
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getWalletFromMnemonic(mnemonic) {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  return wallet.accounts[0];
}

async function getCurrentNonce(address) {
  const response = await fetch(`${API_URL}/extended/v1/address/${address}/nonces`);
  const data = await response.json();
  return data.possible_next_nonce;
}

async function getBalance(address) {
  const response = await fetch(`${API_URL}/extended/v1/address/${address}/stx`);
  const data = await response.json();
  return parseInt(data.balance);
}

// Mint NFT with proper post-conditions
async function mintNFT(account, address, nonce) {
  const uri = randomElement(NFT_URIS);
  
  const tx = await makeContractCall({
    contractAddress: CONTRACT_OWNER,
    contractName: 'stacksmint-nft',
    functionName: 'mint',
    functionArgs: [stringAsciiCV(uri)],
    senderKey: account.stxPrivateKey,
    network: 'mainnet',
    nonce: BigInt(nonce),
    fee: BigInt(3000),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow, // FIXED: Allow STX transfer
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint', uri, result };
}

// Create collection with proper post-conditions
async function createCollection(account, address, nonce) {
  const name = randomElement(COLLECTION_NAMES) + ' #' + randomInt(1, 999);
  const description = randomElement(COLLECTION_DESCRIPTIONS);
  const image = `https://stacksmint.io/collections/${randomInt(1, 100)}.png`;
  const maxSupply = randomInt(100, 10000);
  
  const tx = await makeContractCall({
    contractAddress: CONTRACT_OWNER,
    contractName: 'stacksmint-collection',
    functionName: 'create-collection',
    functionArgs: [
      stringAsciiCV(name.slice(0, 64)),
      stringAsciiCV(description.slice(0, 256)),
      stringAsciiCV(image.slice(0, 256)),
      uintCV(maxSupply),
    ],
    senderKey: account.stxPrivateKey,
    network: 'mainnet',
    nonce: BigInt(nonce),
    fee: BigInt(5000),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow, // FIXED: Allow STX transfer
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'create-collection', name, result };
}

// Mint to collection
async function mintToCollection(account, address, nonce, collectionId) {
  const uri = randomElement(NFT_URIS);
  
  const tx = await makeContractCall({
    contractAddress: CONTRACT_OWNER,
    contractName: 'stacksmint-nft',
    functionName: 'mint-to-collection',
    functionArgs: [stringAsciiCV(uri), uintCV(collectionId)],
    senderKey: account.stxPrivateKey,
    network: 'mainnet',
    nonce: BigInt(nonce),
    fee: BigInt(3500),
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow, // FIXED: Allow STX transfer
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint-to-collection', uri, collectionId, result };
}

// Decide random actions for a wallet
function decideActions() {
  const actions = [];
  const roll = Math.random();
  
  if (roll < 0.3) {
    // 30%: Just mint 1-2 NFTs
    const mintCount = randomInt(1, 2);
    for (let i = 0; i < mintCount; i++) actions.push('mint');
  } else if (roll < 0.6) {
    // 30%: Create collection + mint to it
    actions.push('create-collection');
    actions.push('mint-to-collection');
  } else if (roll < 0.85) {
    // 25%: Multiple mints
    const mintCount = randomInt(2, 3);
    for (let i = 0; i < mintCount; i++) actions.push('mint');
  } else {
    // 15%: Create collection only
    actions.push('create-collection');
  }
  
  return actions;
}

async function processWallet(walletData, walletIndex) {
  const { mnemonic, address } = walletData;
  
  console.log(`\n🔄 Wallet ${walletIndex} | ${address.slice(0, 15)}...`);
  
  try {
    const account = await getWalletFromMnemonic(mnemonic);
    const balance = await getBalance(address);
    
    if (balance < 30000) { // Need at least 0.03 STX
      console.log(`   ⚠️ Low balance (${balance/1000000} STX), skipping`);
      return { wallet: walletIndex, status: 'skipped', reason: 'low balance' };
    }
    
    let nonce = await getCurrentNonce(address);
    const actions = decideActions();
    console.log(`   📋 ${actions.join(', ')}`);
    
    const results = [];
    let collectionId = randomInt(1, 20);
    
    for (const action of actions) {
      try {
        let result;
        
        switch (action) {
          case 'mint':
            result = await mintNFT(account, address, nonce);
            break;
          case 'create-collection':
            result = await createCollection(account, address, nonce);
            collectionId = randomInt(1, 50);
            break;
          case 'mint-to-collection':
            result = await mintToCollection(account, address, nonce, collectionId);
            break;
        }
        
        if (result.result.txid) {
          console.log(`   ✅ ${action}: ${result.result.txid.slice(0, 12)}...`);
          results.push({ action, txid: result.result.txid, success: true });
        } else {
          console.log(`   ❌ ${action}: ${result.result.error || 'Failed'}`);
          results.push({ action, error: result.result.error, success: false });
        }
        
        nonce++;
      } catch (err) {
        console.log(`   ❌ ${action}: ${err.message.slice(0, 50)}`);
        results.push({ action, error: err.message, success: false });
        nonce++;
      }
    }
    
    return { wallet: walletIndex, address, status: 'processed', results };
    
  } catch (err) {
    console.log(`   ❌ Error: ${err.message.slice(0, 50)}`);
    return { wallet: walletIndex, status: 'error', error: err.message };
  }
}

async function main() {
  console.log('🎭 StacksMint Fast Interaction Script (FIXED)');
  console.log('='.repeat(50));
  console.log('✅ PostConditionMode.Allow enabled\n');
  
  const walletsData = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
  const wallets = walletsData.wallets.slice(0, 50);
  
  // Shuffle for randomness
  const shuffledWallets = shuffleArray(wallets);
  
  console.log(`📊 Wallets: ${shuffledWallets.length}`);
  console.log(`🎲 Order: Randomized\n`);
  
  const allResults = [];
  
  for (let i = 0; i < shuffledWallets.length; i++) {
    const wallet = shuffledWallets[i];
    const result = await processWallet(wallet, wallet.index);
    allResults.push(result);
    
    // Small delay to avoid rate limiting (1-3 seconds)
    const delay = randomInt(1000, 3000);
    await new Promise(r => setTimeout(r, delay));
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  
  const processed = allResults.filter(r => r.status === 'processed').length;
  const skipped = allResults.filter(r => r.status === 'skipped').length;
  const errors = allResults.filter(r => r.status === 'error').length;
  
  let successTxs = 0, failedTxs = 0;
  allResults.forEach(r => {
    if (r.results) {
      successTxs += r.results.filter(x => x.success).length;
      failedTxs += r.results.filter(x => !x.success).length;
    }
  });
  
  console.log(`✅ Wallets processed: ${processed}`);
  console.log(`⏭️ Wallets skipped: ${skipped}`);
  console.log(`❌ Wallet errors: ${errors}`);
  console.log(`📝 Successful TXs: ${successTxs}`);
  console.log(`❌ Failed TXs: ${failedTxs}`);
  
  fs.writeFileSync('interaction-results-v2.json', JSON.stringify(allResults, null, 2));
  console.log('\n💾 Saved to interaction-results-v2.json');
}

main().catch(console.error);
