import axios from 'axios';

export class TokenUtils {
  /**
   * Validate Solana address format
   */
  static isValidSolanaAddress(address: string): boolean {
    // Basic Solana address validation (base58, 32-44 characters)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  /**
   * Get current token balance for a specific wallet and token
   */
  static async getTokenBalance(
    apiKey: string,
    walletAddress: string,
    tokenMint: string
  ): Promise<number> {
    try {
      const response = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            {
              mint: tokenMint
            },
            {
              encoding: 'jsonParsed'
            }
          ]
        }
      );

      if (response.data.result?.value && response.data.result.value.length > 0) {
        const account = response.data.result.value[0];
        return account.account.data.parsed.info.tokenAmount.uiAmount || 0;
      }

      return 0;
    } catch (error) {
      console.error(`Error fetching balance for ${walletAddress}:`, error);
      return 0;
    }
  }

  /**
   * Batch get token balances for multiple wallets
   */
  static async getTokenBalancesBatch(
    apiKey: string,
    walletAddresses: string[],
    tokenMint: string,
    batchSize: number = 5
  ): Promise<Map<string, number>> {
    const balanceMap = new Map<string, number>();
    
    for (let i = 0; i < walletAddresses.length; i += batchSize) {
      const batch = walletAddresses.slice(i, i + batchSize);
      
      const promises = batch.map(address => 
        this.getTokenBalance(apiKey, address, tokenMint)
      );
      
      const balances = await Promise.all(promises);
      
      batch.forEach((address, index) => {
        balanceMap.set(address, balances[index]);
      });

      // Add delay to avoid rate limiting
      if (i + batchSize < walletAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return balanceMap;
  }

  /**
   * Format token balance with proper decimal places
   */
  static formatTokenBalance(balance: number, decimals: number = 6): string {
    return balance.toFixed(decimals);
  }

  /**
   * Convert raw token amount to UI amount
   */
  static convertRawToUiAmount(rawAmount: string, decimals: number): number {
    const amount = parseInt(rawAmount);
    return amount / Math.pow(10, decimals);
  }

  /**
   * Get token metadata (name, symbol, decimals)
   */
  static async getTokenMetadata(apiKey: string, tokenMint: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [
            tokenMint,
            {
              encoding: 'jsonParsed'
            }
          ]
        }
      );

      return response.data.result?.value?.data?.parsed?.info || null;
    } catch (error) {
      console.error(`Error fetching metadata for ${tokenMint}:`, error);
      return null;
    }
  }
}
