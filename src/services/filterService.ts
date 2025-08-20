import { WalletData } from '../types';

export class FilterService {
  /**
   * Filter wallets to only include those with fewer than the specified transaction count
   */
  filterByTransactionCount(
    walletMap: Map<string, { count: number; balance: number }>,
    maxTransactionCount: number = 15
  ): Map<string, { count: number; balance: number }> {
    const filteredMap = new Map<string, { count: number; balance: number }>();

    for (const [address, data] of walletMap.entries()) {
      if (data.count < maxTransactionCount) {
        filteredMap.set(address, data);
      }
    }

    console.log(`Filtered wallets: ${walletMap.size} -> ${filteredMap.size} (max ${maxTransactionCount} transactions)`);
    return filteredMap;
  }

  /**
   * Convert wallet map to WalletData array for CSV export
   */
  convertToWalletDataArray(
    walletMap: Map<string, { count: number; balance: number }>,
    tokenMint: string
  ): WalletData[] {
    const walletDataArray: WalletData[] = [];

    for (const [address, data] of walletMap.entries()) {
      // Only include valid wallet addresses
      if (typeof address === 'string' && address.length > 10) {
        walletDataArray.push({
          address,
          tokenBalance: data.balance,
          transactionCount: data.count,
          tokenMint
        });
      }
    }

    return walletDataArray;
  }

  /**
   * Sort wallet data by transaction count (ascending)
   */
  sortByTransactionCount(walletData: WalletData[]): WalletData[] {
    return walletData.sort((a, b) => a.transactionCount - b.transactionCount);
  }

  /**
   * Sort wallet data by token balance (descending)
   */
  sortByTokenBalance(walletData: WalletData[]): WalletData[] {
    return walletData.sort((a, b) => b.tokenBalance - a.tokenBalance);
  }

  /**
   * Get summary statistics for the wallet data
   */
  getSummaryStats(walletData: WalletData[]): {
    totalWallets: number;
    totalBalance: number;
    avgTransactionCount: number;
    avgBalance: number;
  } {
    if (walletData.length === 0) {
      return {
        totalWallets: 0,
        totalBalance: 0,
        avgTransactionCount: 0,
        avgBalance: 0
      };
    }

    const totalBalance = walletData.reduce((sum, wallet) => sum + wallet.tokenBalance, 0);
    const totalTransactions = walletData.reduce((sum, wallet) => sum + wallet.transactionCount, 0);

    return {
      totalWallets: walletData.length,
      totalBalance,
      avgTransactionCount: totalTransactions / walletData.length,
      avgBalance: totalBalance / walletData.length
    };
  }
}
