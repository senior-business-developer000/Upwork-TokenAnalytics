import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { WalletData } from '../types';
import Decimal from 'decimal.js-light';

export class CsvExportService {
  /**
   * Export wallet data to CSV file
   */
  async exportToCSV(
    walletData: WalletData[],
    outputFileName: string = 'token_wallets.csv'
  ): Promise<string> {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputFileName);
      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Create CSV writer
      const csvWriter = createObjectCsvWriter({
        path: outputFileName,
        header: [
          { id: 'address', title: 'Solana Address' },
          { id: 'transactionCount', title: 'Transaction Quantity' },
          { id: 'tokenBalance', title: 'Quantity of Coins Held' },
          { id: 'tokenMint', title: 'Token Mint' },
          { id: 'tokenName', title: 'Token Name' }
        ],
        append: false
      });

      // Write data to CSV
      await csvWriter.writeRecords(walletData);

      console.log(`Successfully exported ${walletData.length} wallet records to ${outputFileName}`);
      return outputFileName;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  /**
   * Export multiple token data to separate CSV files
   */
  async exportMultipleTokens(
    tokenDataMap: Map<string, WalletData[]>,
    baseFileName: string = 'token_wallets'
  ): Promise<string[]> {
    const exportedFiles: string[] = [];

    for (const [tokenMint, walletData] of tokenDataMap.entries()) {
      const fileName = `${baseFileName}_${tokenMint.slice(0, 8)}.csv`;
      const filePath = await this.exportToCSV(walletData, fileName);
      exportedFiles.push(filePath);
    }

    return exportedFiles;
  }

  /**
   * Export combined data from multiple tokens to a single CSV
   */
  async exportCombinedData(
    tokenDataMap: Map<string, WalletData[]>,
    outputFileName: string = 'combined_token_wallets.csv'
  ): Promise<string> {
    const allWalletData: WalletData[] = [];

    for (const walletData of tokenDataMap.values()) {
      allWalletData.push(...walletData);
    }

    return await this.exportToCSV(allWalletData, outputFileName);
  }

  /**
   * Generate a summary report
   */
  async exportSummaryReport(
    tokenDataMap: Map<string, WalletData[]>,
    outputFileName: string = 'summary_report.csv',
    holdersCountMap?: Map<string, number>
  ): Promise<string> {
    const summaryData: any[] = [];

    for (const [tokenMint, walletData] of tokenDataMap.entries()) {
      const totalWallets = walletData.length;
      const totalHolders = holdersCountMap?.get(tokenMint) ?? walletData.filter(w => (w.tokenBalance || 0) > 0).length; // true holders if provided
      const totalBalanceDec = walletData.reduce((sum, wallet) => sum.add(new Decimal(wallet.tokenBalance)), new Decimal(0));
      const totalTxDec = walletData.reduce((sum, wallet) => sum.add(new Decimal(wallet.transactionCount)), new Decimal(0));
      const totalBalance = totalBalanceDec.toNumber();
      const avgTransactionCount = totalWallets ? totalTxDec.div(totalWallets).toNumber() : 0;

      summaryData.push({
        tokenMint,
        totalWallets,
        totalHolders,
        totalBalance: new Decimal(totalBalance).toFixed(6),
        avgTransactionCount: new Decimal(avgTransactionCount).toFixed(2)
      });
    }

    const csvWriter = createObjectCsvWriter({
      path: outputFileName,
      header: [
        { id: 'tokenMint', title: 'Token Mint' },
        { id: 'totalWallets', title: 'Total Wallets' },
        { id: 'totalHolders', title: 'Total Holders' },
        { id: 'totalBalance', title: 'Total Balance' },
        { id: 'avgTransactionCount', title: 'Average Transaction Count' }
      ],
      append: false
    });

    await csvWriter.writeRecords(summaryData);
    console.log(`Summary report exported to ${outputFileName}`);
    return outputFileName;
  }
}
