export interface HeliusTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  meta: {
    err: any;
    fee: number;
    preBalances: number[];
    postBalances: number[];
    innerInstructions: any[];
    logMessages: string[];
    preTokenBalances: TokenBalance[];
    postTokenBalances: TokenBalance[];
    rewards: any[];
    loadedAddresses: any;
    returnData: any;
    computeUnitsConsumed: number;
  };
  transaction: {
    message: {
      accountKeys: string[];
      header: any;
      recentBlockhash: string;
      instructions: any[];
      addressTableLookups: any[];
    };
    signatures: string[];
  };
}

export interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  programId: string;
  uiTokenAmount: {
    tokenAmount?: {
      amount: string;
      decimals: number;
      uiAmount: number;
      uiAmountString: string;
    };
    uiAmount?: number;
  };
}

export interface WalletData {
  address: string;
  tokenBalance: number;
  transactionCount: number;
  tokenMint?: string; // Optional for internal use
}

export interface HeliusApiResponse {
  jsonrpc: string;
  id: number;
  result: HeliusTransaction[];
}

export interface TokenConfig {
  mint: string;
  name?: string;
}
