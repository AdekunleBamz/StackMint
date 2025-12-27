const {
  makeContractCall,
  AnchorMode,
  broadcastTransaction,
  stringAsciiCV,
  uintCV,
  principalCV,
  PostConditionMode,
} = require('@stacks/transactions');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');
require('dotenv').config({ quiet: true });

// Configuration
const MAINNET_VERSION = 22;
const API_URL = 'https://api.mainnet.hiro.so';
const CONTRACT_OWNER = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

// Contract addresses
const CONTRACTS = {
  nft: `${CONTRACT_OWNER}.stacksmint-nft`,
  collection: `${CONTRACT_OWNER}.stacksmint-collection`,
  marketplace: `${CONTRACT_OWNER}.stacksmint-marketplace`,
  treasury: `${CONTRACT_OWNER}.stacksmint-treasury`,
};

// Randomization settings for organic feel
const MIN_DELAY = 30000;   // 30 seconds minimum
const MAX_DELAY = 180000;  // 3 minutes maximum
const MIN_BATCH = 2;       // Process 2-5 wallets at a time
const MAX_BATCH = 5;

// Sample NFT metadata URIs (randomized)
const NFT_URIS = [
  'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1',
  'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/2',
  'ipfs://QmZiMqV4DWYY7xgCRNyoF8BW5vCHkGR9dCLbH3TpzCQwgb/3',
  'ipfs://QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB/4',
  'ipfs://QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8/5',
  'ar://abc123def456_artwork_genesis',
  'ar://xyz789ghi012_digital_collectible',
  'https://stacksmint.io/nft/meta/001.json',
  'https://stacksmint.io/nft/meta/002.json',
  'https://stacksmint.io/nft/meta/003.json',
];

// Collection names (randomized)
const COLLECTION_NAMES = [
  'Genesis Drop',
  'Digital Dreams',
  'Crypto Art Vol 1',
  'Abstract Visions',
  'Pixel Warriors',
  'Neon Nights',
  'Future Relics',
  'Meta Moments',
];

const COLLECTION_DESCRIPTIONS = [
  'A unique collection of digital artwork',
  'Exploring the boundaries of digital creativity',
  'Limited edition collectibles on Stacks',
  'Where art meets blockchain technology',
  'Curated digital experiences',
];

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay() {
  return randomInt(MIN_DELAY, MAX_DELAY);
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

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

async function getWalletFromMnemonic(mnemonic) {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: '',
  });
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

// Contract interaction functions
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
    postConditionMode: PostConditionMode.Allow, // Allow STX transfer for creator fee
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint', uri, result };
}

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
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'create-collection', name, result };
}

async function mintToCollection(account, address, nonce, collectionId) {
  const uri = randomElement(NFT_URIS);
  
  const tx = await makeContractCall({
    contractAddress: CONTRACT_OWNER,
    contractName: 'stacksmint-nft',
    functionName: 'mint-to-collection',
    functionArgs: [
      stringAsciiCV(uri),
      uintCV(collectionId),
    ],
    senderKey: account.stxPrivateKey,
    network: 'mainnet',
    nonce: BigInt(nonce),
    fee: BigInt(3500),
    anchorMode: AnchorMode.Any,
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint-to-collection', uri, collectionId, result };
}

// Decide what actions a wallet should take (randomized)
function decideActions() {
  const actions = [];
  const roll = Math.random();
  
  if (roll < 0.3) {
    // 30% chance: Just mint 1-2 NFTs
    const mintCount = randomInt(1, 2);
    for (let i = 0; i < mintCount; i++) {
      actions.push('mint');
    }
  } else if (roll < 0.6) {
    // 30% chance: Create collection + mint to it
    actions.push('create-collection');
    const mintCount = randomInt(1, 2);
    for (let i = 0; i < mintCount; i++) {
      actions.push('mint-to-collection');
    }
  } else if (roll < 0.85) {
    // 25% chance: Multiple mints
    const mintCount = randomInt(2, 3);
    for (let i = 0; i < mintCount; i++) {
      actions.push('mint');
    }
  } else {
    // 15% chance: Create collection only
    actions.push('create-collection');
  }
  
  return actions;
}

async function processWallet(walletData, walletIndex) {
  const { mnemonic, address } = walletData;
  
  console.log(`\n🔄 Processing Wallet ${walletIndex}`);
  console.log(`   Address: ${address.slice(0, 20)}...`);
  
  try {
    // Get wallet account
    const account = await getWalletFromMnemonic(mnemonic);
    
    // Check balance
    const balance = await getBalance(address);
    console.log(`   Balance: ${balance / 1000000} STX`);
    
    if (balance < 50000) { // Need at least 0.05 STX
      console.log(`   ⚠️ Insufficient balance, skipping`);
      return { wallet: walletIndex, status: 'skipped', reason: 'low balance' };
    }
    
    // Get nonce
    let nonce = await getCurrentNonce(address);
    
    // Decide actions
    const actions = decideActions();
    console.log(`   📋 Actions: ${actions.join(', ')}`);
    
    const results = [];
    let lastCollectionId = randomInt(1, 10); // For mint-to-collection
    
    for (const action of actions) {
      try {
        let result;
        
        // Random micro-delay between actions (2-8 seconds)
        if (results.length > 0) {
          const microDelay = randomInt(2000, 8000);
          await new Promise(r => setTimeout(r, microDelay));
        }
        
        switch (action) {
          case 'mint':
            result = await mintNFT(account, address, nonce);
            break;
          case 'create-collection':
            result = await createCollection(account, address, nonce);
            // Extract collection ID for subsequent mints (simplified - would need to track this)
            lastCollectionId = randomInt(1, 50);
            break;
          case 'mint-to-collection':
            result = await mintToCollection(account, address, nonce, lastCollectionId);
            break;
        }
        
        if (result.result.txid) {
          console.log(`   ✅ ${action}: ${result.result.txid.slice(0, 16)}...`);
          results.push({ action, txid: result.result.txid, success: true });
        } else {
          console.log(`   ❌ ${action}: ${result.result.error || 'Failed'}`);
          results.push({ action, error: result.result.error, success: false });
        }
        
        nonce++;
      } catch (err) {
        console.log(`   ❌ ${action}: ${err.message}`);
        results.push({ action, error: err.message, success: false });
        nonce++;
      }
    }
    
    return { wallet: walletIndex, address, status: 'processed', results };
    
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return { wallet: walletIndex, status: 'error', error: err.message };
  }
}

async function main() {
  console.log('🎭 StacksMint Organic Interaction Script');
  console.log('='.repeat(50));
  console.log('🎲 Randomized timing and actions for natural activity\n');
  
  // Load wallets
  const walletsData = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
  
  // Only use first 50 funded wallets
  const wallets = walletsData.wallets.slice(0, 50);
  
  // Shuffle wallet order for randomness
  const shuffledWallets = shuffleArray(wallets);
  
  console.log(`📊 Wallets to process: ${shuffledWallets.length}`);
  console.log(`🎲 Order: Randomized`);
  console.log(`⏱️ Delays: ${MIN_DELAY/1000}s - ${MAX_DELAY/1000}s (random)`);
  console.log(`📦 Batch size: ${MIN_BATCH}-${MAX_BATCH} wallets (random)\n`);
  
  const allResults = [];
  let processed = 0;
  
  while (processed < shuffledWallets.length) {
    // Random batch size
    const batchSize = randomInt(MIN_BATCH, MAX_BATCH);
    const batch = shuffledWallets.slice(processed, processed + batchSize);
    
    console.log('\n' + '='.repeat(50));
    console.log(`📦 Processing batch: ${batch.length} wallets (${processed + 1}-${processed + batch.length} of ${shuffledWallets.length})`);
    console.log('='.repeat(50));
    
    for (const wallet of batch) {
      const result = await processWallet(wallet, wallet.index);
      allResults.push(result);
      
      // Random delay between wallets within batch (shorter)
      if (batch.indexOf(wallet) < batch.length - 1) {
        const intraDelay = randomInt(5000, 15000); // 5-15 seconds within batch
        console.log(`   ⏳ Next wallet in ${formatTime(intraDelay)}...`);
        await new Promise(r => setTimeout(r, intraDelay));
      }
    }
    
    processed += batch.length;
    
    // Random delay between batches (longer)
    if (processed < shuffledWallets.length) {
      const delay = randomDelay();
      console.log(`\n⏳ Next batch in ${formatTime(delay)}...`);
      console.log(`   (${shuffledWallets.length - processed} wallets remaining)`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 INTERACTION SUMMARY');
  console.log('='.repeat(50));
  
  const successful = allResults.filter(r => r.status === 'processed').length;
  const skipped = allResults.filter(r => r.status === 'skipped').length;
  const errors = allResults.filter(r => r.status === 'error').length;
  
  console.log(`✅ Processed: ${successful}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  
  // Count total transactions
  let totalTxs = 0;
  allResults.forEach(r => {
    if (r.results) {
      totalTxs += r.results.filter(x => x.success).length;
    }
  });
  console.log(`📝 Total transactions: ${totalTxs}`);
  
  // Save results
  fs.writeFileSync('interaction-results.json', JSON.stringify(allResults, null, 2));
  console.log('\n💾 Results saved to interaction-results.json');
}

// Run
main().catch(console.error);
