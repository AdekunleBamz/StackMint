const {
  makeSTXTokenTransfer,
  AnchorMode,
  broadcastTransaction,
} = require('@stacks/transactions');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');
require('dotenv').config({ quiet: true });

// Configuration
const MAINNET_VERSION = 22; // TransactionVersion.Mainnet
const AMOUNT_PER_WALLET = 200000; // 0.2 STX in microSTX
const TX_FEE = 2000; // 0.002 STX fee per transfer
const BATCH_SIZE = 10; // Send 10 transactions at a time
const BATCH_DELAY = 35000; // Wait 35 seconds between batches
const MAX_WALLETS = 50; // Only fund first 50 wallets
const API_URL = 'https://api.mainnet.hiro.so';

async function getDeployerWallet() {
  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) {
    throw new Error('DEPLOYER_MNEMONIC not found in .env');
  }
  
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: '',
  });
  
  return wallet.accounts[0];
}

async function getCurrentNonce(address) {
  const response = await fetch(
    `${API_URL}/extended/v1/address/${address}/nonces`
  );
  const data = await response.json();
  return data.possible_next_nonce;
}

async function getBalance(address) {
  const response = await fetch(
    `${API_URL}/extended/v1/address/${address}/stx`
  );
  const data = await response.json();
  return parseInt(data.balance);
}

async function sendSTX(senderPrivateKey, recipientAddress, amount, nonce) {
  const tx = await makeSTXTokenTransfer({
    recipient: recipientAddress,
    amount: BigInt(amount),
    senderKey: senderPrivateKey,
    network: 'mainnet',
    memo: 'StacksMint Test Funding',
    nonce: BigInt(nonce),
    fee: BigInt(TX_FEE),
    anchorMode: AnchorMode.Any,
  });

  const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
  
  if (result.error) {
    return { error: result.error + ': ' + (result.reason || '') };
  }
  
  return { txid: result.txid };
}

async function fundWallets() {
  console.log('🚀 StacksMint Wallet Funding Script\n');
  console.log('='.repeat(50));
  
  // Load wallets from JSON
  const walletsData = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
  const allWallets = walletsData.wallets;
  
  // Only fund first 50 wallets
  const wallets = allWallets.slice(0, MAX_WALLETS);
  
  console.log(`📊 Wallets to fund: ${wallets.length} (of ${allWallets.length} total)`);
  console.log(`💰 Amount per wallet: ${AMOUNT_PER_WALLET / 1000000} STX`);
  console.log(`💸 Total needed: ${(wallets.length * AMOUNT_PER_WALLET) / 1000000} STX`);
  console.log(`➕ TX fees: ${(wallets.length * TX_FEE) / 1000000} STX`);
  console.log(`📦 Total: ${(wallets.length * (AMOUNT_PER_WALLET + TX_FEE)) / 1000000} STX\n`);
  
  // Get deployer account
  const deployerAccount = await getDeployerWallet();
  const deployerAddress = getStxAddress({
    account: deployerAccount,
    transactionVersion: MAINNET_VERSION,
  });
  
  console.log(`👤 Deployer address: ${deployerAddress}`);
  
  // Check deployer balance
  const balance = await getBalance(deployerAddress);
  console.log(`💰 Deployer balance: ${balance / 1000000} STX`);
  
  const totalNeeded = wallets.length * (AMOUNT_PER_WALLET + TX_FEE);
  if (balance < totalNeeded) {
    console.error(`\n❌ Insufficient balance!`);
    console.error(`   Need: ${totalNeeded / 1000000} STX`);
    console.error(`   Have: ${balance / 1000000} STX`);
    console.error(`   Short: ${(totalNeeded - balance) / 1000000} STX`);
    process.exit(1);
  }
  
  console.log(`\n✅ Sufficient balance. Starting funding...\n`);
  
  // Get starting nonce
  let nonce = await getCurrentNonce(deployerAddress);
  console.log(`📝 Starting nonce: ${nonce}\n`);
  
  const results = {
    success: [],
    failed: [],
  };
  
  // Process in batches
  for (let i = 0; i < wallets.length; i += BATCH_SIZE) {
    const batch = wallets.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(wallets.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (wallets ${i + 1}-${Math.min(i + BATCH_SIZE, wallets.length)})`);
    console.log('-'.repeat(40));
    
    for (const wallet of batch) {
      try {
        const result = await sendSTX(
          deployerAccount.stxPrivateKey,
          wallet.address,
          AMOUNT_PER_WALLET,
          nonce
        );
        
        if (result.error) {
          const errorMsg = result.error.length > 60 ? result.error.slice(0, 60) + '...' : result.error;
          console.log(`❌ Wallet ${wallet.index}: ${errorMsg}`);
          results.failed.push({ wallet: wallet.index, error: result.error });
        } else {
          console.log(`✅ Wallet ${wallet.index}: ${result.txid.slice(0, 16)}...`);
          results.success.push({ wallet: wallet.index, txid: result.txid, address: wallet.address });
        }
        
        nonce++;
      } catch (error) {
        console.log(`❌ Wallet ${wallet.index}: ${error.message}`);
        results.failed.push({ wallet: wallet.index, error: error.message });
        nonce++;
      }
    }
    
    // Wait between batches (except for last batch)
    if (i + BATCH_SIZE < wallets.length) {
      console.log(`\n⏳ Waiting ${BATCH_DELAY / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FUNDING SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  // Save results
  fs.writeFileSync('funding-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to funding-results.json');
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed wallets:');
    results.failed.slice(0, 5).forEach(f => {
      const errorMsg = f.error.length > 50 ? f.error.slice(0, 50) + '...' : f.error;
      console.log(`   Wallet ${f.wallet}: ${errorMsg}`);
    });
    if (results.failed.length > 5) {
      console.log(`   ... and ${results.failed.length - 5} more`);
    }
  }
}

// Run
fundWallets().catch(console.error);
