import axios from 'axios';
import { HeliusTransaction, HeliusApiResponse, TokenBalance, WalletData } from '../types';
import { TokenUtils } from '../utils/tokenUtils';

export class HeliusService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  }

  /**
   * Fetch all transactions for a specific token mint
   */
  async fetchTokenTransactions(tokenMint: string, limit: number = 1000): Promise<HeliusTransaction[]> {
    try {
      console.log(`Fetching transactions for token: ${tokenMint}`);
      
      // Use the correct Helius API method for searching transactions
      const response = await axios.post<HeliusApiResponse>(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'searchTransactions',
          params: {
            query: {
              accounts: [tokenMint]
            },
            limit: limit,
            encoding: 'jsonParsed'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.result) {
        console.log(`Found ${response.data.result.length} transactions for token ${tokenMint}`);
        return response.data.result;
      }

      return [];
    } catch (error: any) {
      // If searchTransactions fails, try alternative approach using getSignaturesForAddress
      console.log(`searchTransactions failed, trying alternative method for token ${tokenMint}`);
      return await this.fetchTokenTransactionsAlternative(tokenMint, limit);
    }
  }

  /**
   * Alternative method to fetch transactions using getSignaturesForAddress
   */
  async fetchTokenTransactionsAlternative(tokenMint: string, limit: number = 1000): Promise<HeliusTransaction[]> {
    try {
      console.log(`Using alternative method for token: ${tokenMint}`);
      
      // First get transaction signatures with recent time range
      const signaturesResponse = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [
            tokenMint,
            {
              limit: limit,
              before: undefined, // Start from most recent
              until: undefined   // No end limit
            }
          ]
        }
      );

      if (!signaturesResponse.data.result || signaturesResponse.data.result.length === 0) {
        console.log(`No signatures found for token ${tokenMint}`);
        return [];
      }

      const signatures = signaturesResponse.data.result.map((sig: any) => sig.signature);
      console.log(`Found ${signatures.length} signatures for token ${tokenMint}`);

      // Then get transaction details for each signature
      const transactions: HeliusTransaction[] = [];
      const batchSize = 5; // Smaller batch size for better success rate

      for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);
        
        // Process each signature individually for better reliability
        for (const signature of batch) {
          try {
            const transactionResponse = await axios.post(
              this.baseUrl,
              {
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                  signature,
                  {
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0
                  }
                ]
              }
            );

            if (transactionResponse.data.result) {
              transactions.push(transactionResponse.data.result);
            }
          } catch (error) {
            console.log(`Failed to get transaction for signature: ${signature.slice(0, 8)}...`);
          }

          // Small delay between individual requests
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Add delay between batches
        if (i + batchSize < signatures.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`Retrieved ${transactions.length} transactions for token ${tokenMint}`);
      return transactions;
    } catch (error) {
      console.error(`Error in alternative method for token ${tokenMint}:`, error);
      return [];
    }
  }

  /**
   * Extract wallet addresses and their transaction counts from transactions
   */
  extractWalletData(transactions: HeliusTransaction[], tokenMint: string): Map<string, { count: number; balance: number }> {
    const walletMap = new Map<string, { count: number; balance: number }>();

    for (const tx of transactions) {
      // Skip failed transactions
      if (tx.meta?.err) continue;

      // Collect owners involved with the specific token in this transaction
      const ownersThisTx = new Set<string>();

      // Consider both pre and post token balances to identify participants for this mint
      if (tx.meta?.preTokenBalances) {
        for (const bal of tx.meta.preTokenBalances) {
          if (bal.mint === tokenMint && typeof bal.owner === 'string' && bal.owner.length > 10) {
            ownersThisTx.add(bal.owner);
          }
        }
      }

      if (tx.meta?.postTokenBalances) {
        for (const bal of tx.meta.postTokenBalances) {
          if (bal.mint === tokenMint && typeof bal.owner === 'string' && bal.owner.length > 10) {
            ownersThisTx.add(bal.owner);
            // Update balance from post balances for this owner
            const current = walletMap.get(bal.owner) || { count: 0, balance: 0 };
            try {
              if (bal.uiTokenAmount && (bal.uiTokenAmount as any).tokenAmount) {
                current.balance = (bal.uiTokenAmount as any).tokenAmount.uiAmount || 0;
              } else if (bal.uiTokenAmount) {
                current.balance = (bal.uiTokenAmount as any).uiAmount || 0;
              } else {
                current.balance = 0;
              }
            } catch (error) {
              console.log(`Error parsing balance for ${bal.owner}:`, error);
              current.balance = 0;
            }
            walletMap.set(bal.owner, current);
          }
        }
      }

      // Increment count once per transaction per owner for this token
      for (const owner of ownersThisTx) {
        const current = walletMap.get(owner) || { count: 0, balance: 0 };
        current.count += 1;
        walletMap.set(owner, current);
      }
    }

    return walletMap;
  }

  /**
   * Get current token balances for wallets using improved batch processing
   */
  async getTokenBalances(tokenMint: string, walletAddresses: string[]): Promise<Map<string, number>> {
    return await TokenUtils.getTokenBalancesBatch(this.apiKey, walletAddresses, tokenMint, 5);
  }

  /**
   * Get total number of holders (token accounts with balance > 0) for a given mint
   */
  async getHoldersCountForMint(tokenMint: string): Promise<number> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [
            // SPL Token Program ID
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            {
              encoding: 'jsonParsed',
              filters: [
                { dataSize: 165 },
                {
                  memcmp: {
                    // Mint is at offset 0 in token account state
                    offset: 0,
                    bytes: tokenMint
                  }
                }
              ]
            }
          ]
        }
      );

      const accounts = response.data?.result || [];
      let holders = 0;
      for (const acc of accounts) {
        try {
          const ui = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
          if (typeof ui === 'number' && ui > 0) holders += 1;
        } catch (_) {
          // ignore malformed accounts
        }
      }
      return holders;
    } catch (error) {
      console.error(`Error fetching holders for mint ${tokenMint}:`, error);
      return 0;
    }
  }
}
