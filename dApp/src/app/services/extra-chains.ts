import { Chain } from "viem"


export const dChainTestnet = {
    id: 2713017997578000,
    name: 'DChain Testnet',
    network: 'dchain',
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io'] },
      default: { http: ['https://dchaintestnet-2713017997578000-1.jsonrpc.testnet.sagarpc.io'] },
    },
    blockExplorers: {
      etherscan: { name: 'Saga', url: 'https://dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io' },
      default: { name: 'Saga', url: 'https://dchaintestnet-2713017997578000-1.testnet.sagaexplorer.io/' },
    },
    contracts: {
      multicall3: {
        address: '0x2F91F4B170F0D4897FdD24A94833F3485ed3372a',
        blockCreated: 1559859,
      },
    },
  } as  Chain
  
  export const ganache = {
    id: 1337,
    name: 'Ganache',
    network: 'ganache',
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['http://127.0.0.1:7545'] },
      default: { http: ['http://127.0.0.1:7545'] },
    },
    // blockExplorers: {
    //   etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    //   default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    // },
    // contracts: {
    //   multicall3: {
    //     address: '0xca11bde05977b3631167028862be2a173976ca11',
    //     blockCreated: 11_907_934,
    //   },
    // },
  } as  Chain


  export const opencampus = {
    id: 656476,
    name: "Open Campus",
    network: "opencampus",
    rpcUrls: {
      public: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
      default: { http: ["https://rpc.open-campus-codex.gelato.digital"] },
    },
    blockExplorers: {
      default: {
        name: "Open Campus Codex",
        url: "https://opencampus-codex.blockscout.com",
        apiUrl: "https://opencampus-codex.blockscout.com/api",
      },
    },
    nativeCurrency: {
      decimals: 18,
      name: "EDU",
      symbol: "EDU",
    },
    testnet: true,
  } as Chain;


  export const core_testnet = {
    id: 1115,
    name: 'Core testnet',
    network: 'Core',
    nativeCurrency: {
      decimals: 18,
      name: 'tCore',
      symbol: 'tCore',
    },
    rpcUrls: {
      public: { http: ["https://rpc.test.btcs.network"] },
      default: { http: ["https://rpc.test.btcs.network"] },
    },
    blockExplorers: {
      meterscan: { name: 'Core Scan', url: 'https://scan.test.btcs.network' },
      default: { name: 'Core Scan', url: 'https://scan.test.btcs.network' },
    },
    testnet: true,
    contracts: {
      multicall3: {
        address: '0x9F8FBFb135bfA9233347FA43516E6Ce233EA7e1D',
        blockCreated: 18702415,
      },
    },
  } as  Chain


  export const galadriel_devnet = {
    id: 696969,
    name: "Galadriel",
    network: "Galadriel",
    rpcUrls: {
      public: { http: ["https://devnet.galadriel.com/"] },
      default: { http: ["https://devnet.galadriel.com/"] },
    },
    blockExplorers: {
      default: {
        name: "Galadriel Explorer",
        url: "https://explorer.galadriel.com",
        apiUrl: "https://explorer.galadriel.com/api",
      },
    },
    nativeCurrency: {
      decimals: 18,
      name: "GAL",
      symbol: "GAL",
    },
    testnet: true,
} as Chain;


export const neo_x_testnet = {
  id: 12227332,
  name: "NEO X",
  network: "NEO X",
  rpcUrls: {
    public: { http: ["https://neoxt4seed1.ngd.network"] },
    default: { http: ["https://neoxt4seed1.ngd.network"] },
  },
  blockExplorers: {
    default: {
      name: "Neo X Explorer",
      url: "https://xt4scan.ngd.network",
      apiUrl: "https://xt4scan.ngd.network/api",
    },
  },
  nativeCurrency: {
    decimals: 18,
    name: "GAS",
    symbol: "GAS",
  },
  testnet: true,
} as Chain;



export const neo_x = {
  id: 47763,
  name: "NEO X",
  network: "NEO X",
  rpcUrls: {
    public: { http: ["https://mainnet-1.rpc.banelabs.org"] },
    default: { http: ["https://mainnet-1.rpc.banelabs.org"] },
  },
  blockExplorers: {
    default: {
      name: "Neo X Explorer",
      url: "https://xexplorer.neo.org",
      apiUrl: "https://xexplorer.neo.org",
    },
  },
  nativeCurrency: {
    decimals: 18,
    name: "GAS",
    symbol: "GAS",
  },
  testnet: false,
} as Chain;