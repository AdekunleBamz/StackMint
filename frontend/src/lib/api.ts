const API_BASE = 'https://api.mainnet.hiro.so';

export async function fetchNFTs(address: string) {
  const res = await fetch(`${API_BASE}/extended/v1/tokens/nft/holdings?principal=${address}`);
  return res.json();
}

export async function fetchSTXBalance(address: string) {
  const res = await fetch(`${API_BASE}/extended/v1/address/${address}/stx`);
  return res.json();
}

export async function fetchTransactions(address: string) {
  const res = await fetch(`${API_BASE}/extended/v1/address/${address}/transactions`);
  return res.json();
}
