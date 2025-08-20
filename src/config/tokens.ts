import { TokenConfig } from '../types';

// Configure your Solana token addresses here
// Replace these with your actual token addresses
export const TOKENS: TokenConfig[] = [
  // Popular Solana tokens (examples) - reduced for testing
  { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', name: 'USDC' },
  { mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', name: 'USDT' },
  { mint: 'So11111111111111111111111111111111111111112', name: 'SOL' },
  { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'BONK' },
  { mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', name: 'mSOL' }
];

// Configuration options
export const CONFIG = {
  // Maximum number of transactions for filtering (default: 15)
  MAX_TRANSACTION_COUNT: 15,
  // Whether to export separate files for each token
  EXPORT_SEPARATE_FILES: false,
  // Delay between API requests (in milliseconds)
  REQUEST_DELAY: 1000,
  // Batch size for token balance requests
  BATCH_SIZE: 5,
  // Maximum number of transactions to fetch per token
  MAX_TRANSACTIONS_PER_TOKEN: 20
};

// Popular Solana token addresses for reference
export const POPULAR_TOKENS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  SOL: 'So11111111111111111111111111111111111111112',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  stSOL: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  jitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
};
