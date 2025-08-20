import * as dotenv from 'dotenv';
import { HeliusService } from './services/heliusService';
import { FilterService } from './services/filterService';
import { CsvExportService } from './services/csvExportService';
import { TokenConfig, WalletData } from './types';
import { TOKENS, CONFIG } from './config/tokens';

dotenv.config();

class TokenWalletAnalyzer {
  private heliusService: HeliusService;
  private filterService: FilterService;
  private csvExportService: CsvExportService;

  constructor(apiKey: string) {
    this.heliusService = new HeliusService(apiKey);
    this.filterService = new FilterService();
    this.csvExportService = new CsvExportService();
  }

  async analyzeToken(tokenMint: string, maxTransactionCount: number = 15): Promise<WalletData[]> {
    console.log(`\n=== Analyzing token: ${tokenMint} ===`);
    
    try {
      const transactions = await this.heliusService.fetchTokenTransactions(tokenMint, CONFIG.MAX_TRANSACTIONS_PER_TOKEN);
      
      if (transactions.length === 0) {
        console.log(`No transactions found for token ${tokenMint}`);
        return [];
      }

      const walletMap = this.heliusService.extractWalletData(transactions, tokenMint);
      console.log(`Found ${walletMap.size} unique wallets`);

      const filteredWallets = this.filterService.filterByTransactionCount(walletMap, maxTransactionCount);

      const walletData = this.filterService.convertToWalletDataArray(filteredWallets, tokenMint);

      const sortedWalletData = this.filterService.sortByTransactionCount(walletData);

      const stats = this.filterService.getSummaryStats(sortedWalletData);
      console.log(`Summary for ${tokenMint}:`);
      console.log(`  - Total wallets: ${stats.totalWallets}`);
      console.log(`  - Total balance: ${stats.totalBalance.toFixed(6)}`);
      console.log(`  - Average transaction count: ${stats.avgTransactionCount.toFixed(2)}`);

      return sortedWalletData;
    } catch (error) {
      console.error(`Error analyzing token ${tokenMint}:`, error);
      return [];
    }
  }

  async analyzeMultipleTokens(
    tokens: TokenConfig[],
    maxTransactionCount: number = 15,
    exportSeparateFiles: boolean = false
  ): Promise<void> {
    console.log(`\n=== Starting analysis of ${tokens.length} tokens ===`);
    
    const tokenDataMap = new Map<string, WalletData[]>();
    const startTime = Date.now();

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      console.log(`\nProcessing token ${i + 1}/${tokens.length}: ${token.mint}`);
      
      const walletData = await this.analyzeToken(token.mint, maxTransactionCount);
      tokenDataMap.set(token.mint, walletData);

      if (i < tokens.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n=== Analysis completed in ${totalTime.toFixed(2)} seconds ===`);

    const outputFileName = process.env.OUTPUT_FILE_NAME || 'token_wallets.csv';
    
    if (exportSeparateFiles) {
      const exportedFiles = await this.csvExportService.exportMultipleTokens(tokenDataMap);
      console.log(`\nExported separate files: ${exportedFiles.join(', ')}`);
    } else {
      const combinedFile = await this.csvExportService.exportCombinedData(tokenDataMap, outputFileName);
      console.log(`\nExported combined data to: ${combinedFile}`);
    }

    // Export summary report
    const summaryFile = await this.csvExportService.exportSummaryReport(tokenDataMap);
    console.log(`Summary report exported to: ${summaryFile}`);

    // Print final summary
    this.printFinalSummary(tokenDataMap);
  }

  /**
   * Print final summary of all analyzed tokens
   */
  private printFinalSummary(tokenDataMap: Map<string, WalletData[]>): void {
    console.log('\n=== FINAL SUMMARY ===');
    
    let totalWallets = 0;
    let totalBalance = 0;
    let totalTransactions = 0;

    for (const [tokenMint, walletData] of tokenDataMap.entries()) {
      const stats = this.filterService.getSummaryStats(walletData);
      totalWallets += stats.totalWallets;
      totalBalance += stats.totalBalance;
      totalTransactions += stats.avgTransactionCount * stats.totalWallets;

      console.log(`${tokenMint}: ${stats.totalWallets} wallets, ${stats.totalBalance.toFixed(6)} balance`);
    }

    console.log(`\nTOTAL ACROSS ALL TOKENS:`);
    console.log(`- Total wallets: ${totalWallets}`);
    console.log(`- Total balance: ${totalBalance.toFixed(6)}`);
    console.log(`- Average transaction count: ${(totalTransactions / totalWallets || 0).toFixed(2)}`);
  }
}

// Main execution
async function main() {
  const apiKey = process.env.HELIUS_API_KEY;
  
  if (!apiKey) {
    console.error('HELIUS_API_KEY is required. Please set it in your .env file.');
    process.exit(1);
  }

  const analyzer = new TokenWalletAnalyzer(apiKey);
  
  try {
    await analyzer.analyzeMultipleTokens(TOKENS, CONFIG.MAX_TRANSACTION_COUNT, CONFIG.EXPORT_SEPARATE_FILES);
    console.log('\n✅ Analysis completed successfully!');
  } catch (error) {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}
