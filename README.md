# Helius Token Wallet Analyzer

A Node.js TypeScript application that uses the Helius API to analyze Solana token wallets. The application fetches transaction data for specified tokens, filters wallets based on transaction count, and exports the results to CSV format.

## Features

- **Token Transaction Analysis**: Fetches all transactions for specified Solana tokens using the Helius API
- **Wallet Filtering**: Filters wallets to only include those with fewer than 15 transactions (configurable)
- **CSV Export**: Exports wallet data including address, token balance, and transaction count
- **Multiple Token Support**: Can analyze multiple tokens simultaneously
- **Summary Reports**: Generates summary statistics and reports
- **Rate Limiting**: Built-in delays to respect API rate limits

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Helius API key

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp env.example .env
   ```

4. Add your Helius API key to the `.env` file:
   ```
   HELIUS_API_KEY=your_helius_api_key_here
   OUTPUT_FILE_NAME=token_wallets.csv
   ```

## Usage

### Basic Usage

1. **Configure your tokens**: Edit the `tokens` array in `src/index.ts` with your desired Solana token addresses:

   ```typescript
   const tokens: TokenConfig[] = [
     { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USDC' },
     { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', name: 'USDT' },
     // Add more tokens here...
   ];
   ```

2. **Run the application**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

### Output Files

The application generates the following files:

- **`token_wallets.csv`** (or custom name): Combined wallet data for all tokens
- **`summary_report.csv`**: Summary statistics for each token
- **`token_wallets_[TOKEN_ID].csv`**: Individual files for each token (if using separate files mode)

### CSV Output Format

The CSV files contain the following columns:

| Column | Description |
|--------|-------------|
| Wallet Address | The Solana wallet address |
| Token Balance | Current token balance for that wallet |
| Transaction Count | Number of transactions with the token |
| Token Mint | The token's mint address |

## Configuration

### Environment Variables

- `HELIUS_API_KEY`: Your Helius API key (required)
- `OUTPUT_FILE_NAME`: Custom name for the output CSV file (optional)

### Code Configuration

You can modify the following parameters in `src/index.ts`:

- `maxTransactionCount`: Maximum number of transactions for filtering (default: 15)
- `exportSeparateFiles`: Whether to export separate files for each token (default: false)
- `tokens`: Array of token configurations to analyze

## API Usage

The application uses the following Helius API endpoints:

- `searchTransactions`: Fetches transaction history for tokens
- `getTokenAccountsByOwner`: Gets current token balances for wallets

## Rate Limiting

The application includes built-in delays between API requests to respect rate limits:
- 1 second delay between token analysis
- 100ms delay between batch requests for token balances

## Error Handling

The application includes comprehensive error handling:
- API request failures are logged and handled gracefully
- Failed transactions are filtered out
- Missing or invalid data is handled appropriately

## Development

### Project Structure

```
src/
├── index.ts              # Main application entry point
├── types/
│   └── index.ts          # TypeScript interfaces and types
└── services/
    ├── heliusService.ts  # Helius API integration
    ├── filterService.ts  # Wallet filtering logic
    └── csvExportService.ts # CSV export functionality
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Example Token Addresses

Here are some popular Solana token addresses you can use for testing:

- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- **SOL**: `So11111111111111111111111111111111111111112`
- **BONK**: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
- **stSOL**: `7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj`

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Helius API key is correctly set in the `.env` file
2. **404 Error on searchTransactions**: This is expected for some Helius API plans. The application automatically falls back to an alternative method using `getSignaturesForAddress` and `getTransaction`
3. **Rate Limiting**: If you encounter rate limiting, increase the delay between requests
4. **No Transactions Found**: Some tokens may have no recent transactions or may be invalid

### Testing Your API Connection

Before running the full application, test your API connection:

```bash
npm run test-api
```

This will verify that your Helius API key is working and test the available methods.

### Debug Mode

To enable more detailed logging, you can modify the console.log statements in the code or add additional logging as needed.

## License

MIT License - feel free to use this code for your own projects.

## Support

For issues related to:
- **Helius API**: Check the [Helius documentation](https://docs.helius.xyz/)
- **Solana**: Check the [Solana documentation](https://docs.solana.com/)
- **This application**: Open an issue in the repository
