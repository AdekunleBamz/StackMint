const {
  makeSTXTokenTransfer,
  AnchorMode,
  broadcastTransaction,
} = require('@stacks/transactions');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');
require('dotenv').config();

const MNEMONIC = process.env.DEPLOYER_MNEMONIC;
const AMOUNT_PER_WALLET = 200000; // 0.2 STX in microSTX
const API_URL = 'https://api.mainnet.hiro.so';

async function getDeployerAccount() {
  const wallet = await generateWallet({ secretKey: MNEMONIC, password: '' });
  return wallet.accounts[0];
}

async function getCurrentNonce(address) {
  const response = await fetch(`${API_URL}/extended/v1/address/${address}/nonces`);
  const data = await response.json();
  return data.possible_next_nonce;
}

async function main() {
  console.log('💰 Funding wallets 51-100...\n');
  
  const deployerAccount = await getDeployerAccount();
  const deployerAddress = getStxAddress({ account: deployerAccount, transactionVersion: 22 });
  
  console.log(`Deployer: ${deployerAddress}`);
  
  // Check deployer balance
  const balRes = await fetch(`${API_URL}/extended/v1/address/${deployerAddress}/stx`);
  const balData = await balRes.json();
  console.log(`Balance: ${parseInt(balData.balance) / 1000000} STX\n`);
  
  const walletsData = JSON.parse(fs.readFileSync('wallets.json', 'utf8'));
  const wallets = walletsData.wallets.slice(50, 100); // Wallets 51-100
  
  let nonce = await getCurrentNonce(deployerAddress);
  console.log(`Starting nonce: ${nonce}\n`);
  
  const results = [];
  
  for (const wallet of wallets) {
    try {
      const tx = await makeSTXTokenTransfer({
        recipient: wallet.address,
        amount: BigInt(AMOUNT_PER_WALLET),
        senderKey: deployerAccount.stxPrivateKey,
        network: 'mainnet',
        nonce: BigInt(nonce),
        fee: BigInt(2000),
        anchorMode: AnchorMode.Any,
      });
      
      const result = await broadcastTransaction({ transaction: tx, network: 'mainnet' });
      
      if (result.txid) {
        console.log(`✅ Wallet ${wallet.index}: ${result.txid.slice(0, 12)}...`);
        results.push({ wallet: wallet.index, txid: result.txid, success: true });
      } else {
        console.log(`❌ Wallet ${wallet.index}: ${result.error || 'Failed'}`);
        results.push({ wallet: wallet.index, error: result.error, success: false });
      }
      
      nonce++;
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
      
    } catch (err) {
      console.log(`❌ Wallet ${wallet.index}: ${err.message.slice(0, 50)}`);
      results.push({ wallet: wallet.index, error: err.message, success: false });
      nonce++;
    }
  }
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ Funded ${successful}/50 wallets`);
  console.log(`💸 Total sent: ${(successful * AMOUNT_PER_WALLET) / 1000000} STX`);
}

main().catch(console.error);
