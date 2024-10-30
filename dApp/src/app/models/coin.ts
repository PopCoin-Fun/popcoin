export type Coin = {
    address: string;
    banner: string;
    chainId: number;
    createdOn: string;
    creator: string;
    creatorDisplayName?: string;
    creatorDisplayPicture?: string;
    description: string;
    id: string;
    isMigrated: boolean;
    logo: string;
    lpTokenAddress: string | undefined;
    marketCap: number;
    name: string;
    routerAddress: string;
    symbol: string;
    telegram?: string;
    twitter?: string;
    userId: number;
    website?: string;
    usdRate: number;
  }
  