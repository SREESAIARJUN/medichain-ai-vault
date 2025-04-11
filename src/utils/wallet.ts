import { AptosClient } from "aptos";

interface WalletConnectionResult {
  address: string;
  connected: boolean;
  publicKey?: string;
}

const NODE_URL = "https://fullnode.mainnet.aptoslabs.com"; // Use devnet if needed
const client = new AptosClient(NODE_URL);

// Connect to Aptos wallet (Petra or Martian)
export const connectWallet = async (): Promise<WalletConnectionResult> => {
  try {
    if ((window as any).martian) {
      const response = await (window as any).martian.connect();
      const account = await (window as any).martian.account();
      return {
        address: account.address,
        connected: true,
        publicKey: account.publicKey
      };
    } else if ((window as any).petra) {
      const response = await (window as any).petra.connect();
      const account = await (window as any).petra.account();
      return {
        address: account.address,
        connected: true,
        publicKey: account.publicKey
      };
    } else {
      throw new Error("No compatible Aptos wallet found. Please install Martian or Petra.");
    }
  } catch (err) {
    console.error("Wallet connection failed:", err);
    throw err;
  }
};

// Get APT balance of wallet
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const resources = await client.getAccountResources(address);
    const coinStore = resources.find(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    return coinStore?.data?.coin?.value ?? "0";
  } catch (err) {
    console.error("Failed to fetch wallet balance:", err);
    return "0";
  }
};

// Get NFT tokens associated with the wallet
export const getWalletNFTs = async (address: string): Promise<any[]> => {
  try {
    const resources = await client.getAccountResources(address);
    const tokenStores = resources.filter((r) =>
      r.type.startsWith("0x3::token::TokenStore")
    );
    return tokenStores;
  } catch (err) {
    console.error("Failed to fetch NFTs:", err);
    return [];
  }
};
