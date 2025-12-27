const {
  makeContractCall,
  AnchorMode,
  broadcastTransaction,
  stringAsciiCV,
  uintCV,
  PostConditionMode,
} = require('@stacks/transactions');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');
require('dotenv').config({ quiet: true });

// Configuration
const API_URL = 'https://api.mainnet.hiro.so';
const CONTRACT_OWNER = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

// Sample NFT metadata URIs
const NFT_URIS = [
  'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/1',
  'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/2',
  'ipfs://QmZiMqV4DWYY7xgCRNyoF8BW5vCHkGR9dCLbH3TpzCQwgb/3',
  'ar://abc123def456_artwork_genesis',
  'ar://xyz789ghi012_digital_collectible',
  'https://stacksmint.io/nft/meta/001.json',
  'https://stacksmint.io/nft/meta/002.json',
  'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
];

const COLLECTION_NAMES = [
  'Genesis Drop', 'Digital Dreams', 'Crypto Art Vol 1', 'Abstract Visions',
  'Pixel Warriors', 'Neon Nights', 'Future Relics', 'Meta Moments',
  'Chain Artifacts', 'Stacks Legends', 'Block Canvas', 'Bitcoin NFT',
];

const COLLECTION_DESCRIPTIONS = [
  'A unique collection of digital artwork',
  'Exploring the boundaries of digital creativity',
  'Limited edition collectibles on Stacks',
  'One of a kind digital masterpieces',
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

// Mint NFT
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
    postConditionMode: PostConditionMode.Allow,
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint', uri, result };
}

// Create collection
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
    postConditionMode: PostConditionMode.Allow,
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
    postConditionMode: PostConditionMode.Allow,
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  return { action: 'mint-to-collection', uri, collectionId, result };
}

// Decide random actions for a wallet
function decideActions() {
  const actions = [];
  const roll = Math.random();
  
  if (roll < 0.25) {
    // 25%: Just mint 1-2 NFTs
    const mintCount = randomInt(1, 2);
    for (let i = 0; i < mintCount; i++) actions.push('mint');
  } else if (roll < 0.5) {
    // 25%: Create collection + mint to it
    actions.push('create-collection');
    actions.push('mint-to-collection');
  } else if (roll < 0.7) {
    // 20%: Multiple mints
    const mintCount = randomInt(2, 3);
    for (let i = 0; i < mintCount; i++) actions.push('mint');
  } else if (roll < 0.85) {
    // 15%: Create collection only
    actions.push('create-collection');
  } else {
    // 15%: Single mint
    actions.push('mint');
  }
  
  return actions;
}

async function processWallet(walletData, index) {
  const { mnemonic, address } = walletData;
  
  console.log(`\n🔄 [${index}] Wallet ${walletData.index} | ${address.slice(0, 12)}...`);
  
  try {
    const account = await getWalletFromMnemonic(mnemonic);
    const balance = await getBalance(address);
    
    if (balance < 25000) { // Need at least 0.025 STX
      console.log(`   ⚠️ Low balance (${balance/1000000} STX), skipping`);
      return { wallet: walletData.index, status: 'skipped', reason: 'low balance' };
    }
    
    let nonce = await getCurrentNonce(address);
    const actions = decideActions();
    console.log(`   📋 ${actions.join(', ')} | Balance: ${(balance/1000000).toFixed(3)} STX`);
    
    const results = [];
    let collectionId = randomInt(1, 30);
    
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
        console.log(`   ❌ ${action}: ${err.message.slice(0, 40)}`);
        results.push({ action, error: err.message, success: false });
        nonce++;
      }
    }
    
    return { wallet: walletData.index, address, status: 'processed', results };
    
  } catch (err) {
    console.log(`   ❌ Error: ${err.message.slice(0, 40)}`);
    return { wallet: walletData.index, status: 'error', error: err.message };
  }
}

async function main() {
  console.log('🎭 StacksMint Combined Interaction Script');
  console.log('='.repeat(50));
  console.log('✅ Randomized timing & actions');
  console.log('✅ PostConditionMode.Allow enabled\n');
  
  const walletsData = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
  
  // Failed wallets from batch 1 (rate limited)
  const failedFromBatch1 = [2, 10, 21, 25, 31, 34, 36, 37, 44, 47];
  
  // New wallets 51-100
  const newWallets = walletsData.wallets.slice(50, 100);
  
  // Get failed wallets from batch 1
  const retryWallets = walletsData.wallets.filter(w => failedFromBatch1.includes(w.index));
  
  // Combine and shuffle
  const allWallets = shuffleArray([...retryWallets, ...newWallets]);
  
  console.log(`📊 Total wallets: ${allWallets.length}`);
  console.log(`   - Retry from batch 1: ${retryWallets.length}`);
  console.log(`   - New (51-100): ${newWallets.length}`);
  console.log(`🎲 Order: Randomized`);
  console.log(`⏱️ Timing: Random delays (2-8 seconds)\n`);
  
  const allResults = [];
  
  for (let i = 0; i < allWallets.length; i++) {
    const wallet = allWallets[i];
    const result = await processWallet(wallet, i + 1);
    allResults.push(result);
    
    // Random delay between wallets (2-8 seconds)
    const delay = randomInt(2000, 8000);
    if (i < allWallets.length - 1) {
      console.log(`   ⏳ Waiting ${(delay/1000).toFixed(1)}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL SUMMARY');
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
  
  fs.writeFileSync('interaction-results-v3.json', JSON.stringify(allResults, null, 2));
  console.log('\n💾 Saved to interaction-results-v3.json');
}

main().catch(console.error);
