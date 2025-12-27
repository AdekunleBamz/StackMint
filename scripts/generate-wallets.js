const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const { TransactionVersion } = require('@stacks/transactions');
const bip39 = require('bip39');
const fs = require('fs');

// TransactionVersion.Mainnet = 22
const MAINNET_VERSION = 22;

async function generateWallets(count) {
  console.log(`Generating ${count} wallets...`);
  
  let envContent = '# StacksMint Test Wallets\n';
  envContent += '# Generated: ' + new Date().toISOString() + '\n\n';
  envContent += '# Deployer wallet (from mainnet.toml)\n';
  envContent += 'DEPLOYER_MNEMONIC="tourist chief old shadow clap injury join spoil birth copper valid skate"\n';
  envContent += 'DEPLOYER_ADDRESS="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N"\n\n';
  envContent += '# Contract addresses\n';
  envContent += 'CONTRACT_NFT="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft"\n';
  envContent += 'CONTRACT_COLLECTION="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-collection"\n';
  envContent += 'CONTRACT_MARKETPLACE="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-marketplace"\n';
  envContent += 'CONTRACT_TREASURY="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury"\n\n';
  envContent += '# Test Wallets (100 wallets)\n';
  envContent += '# Format: WALLET_X_MNEMONIC, WALLET_X_ADDRESS\n\n';

  const wallets = [];

  for (let i = 1; i <= count; i++) {
    // Generate a new mnemonic
    const mnemonic = bip39.generateMnemonic(256); // 24 words
    
    // Generate wallet from mnemonic
    const wallet = await generateWallet({
      secretKey: mnemonic,
      password: '',
    });
    
    // Get mainnet address using version 22
    const address = getStxAddress({
      account: wallet.accounts[0],
      transactionVersion: MAINNET_VERSION,
    });
    
    wallets.push({
      index: i,
      mnemonic: mnemonic,
      address: address
    });
    
    envContent += `WALLET_${i}_MNEMONIC="${mnemonic}"\n`;
    envContent += `WALLET_${i}_ADDRESS="${address}"\n\n`;
    
    if (i % 10 === 0) {
      console.log(`Generated ${i}/${count} wallets...`);
    }
  }

  // Write to .env file
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Saved all wallets to .env file');

  // Also create a JSON file for easier programmatic access
  const walletsJson = {
    deployer: {
      address: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N'
    },
    contracts: {
      nft: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-nft',
      collection: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-collection',
      marketplace: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-marketplace',
      treasury: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksmint-treasury'
    },
    wallets: wallets
  };
  
  fs.writeFileSync('wallets.json', JSON.stringify(walletsJson, null, 2));
  console.log('✅ Saved wallets to wallets.json');
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`   Total wallets: ${count}`);
  console.log(`   First wallet: ${wallets[0].address}`);
  console.log(`   Last wallet: ${wallets[count-1].address}`);
  
  return wallets;
}

generateWallets(100).catch(console.error);
