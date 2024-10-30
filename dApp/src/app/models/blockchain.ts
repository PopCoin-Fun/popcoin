export interface Blockchain {
    id: number;
    rpcurl: string;
    contractAddress: string;
    lastProcessedTradeBlock: number;
    lastProcessedCoinCreatedBlock: number;
    lastProcessedPriceUpdateBlock: number;
    initialVirtualEthReserve: number;
    initialVirtualTokenReserve: number;
    targetMarketCap: number;
  }