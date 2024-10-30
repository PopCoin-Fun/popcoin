import { Injectable } from '@angular/core';
// import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
// import { Web3Modal } from '@web3modal/html'
import {   createConfig, fetchBalance, getBalance, getBlock, getChainId, injected, reconnect, signMessage, simulateContract, 
  watchAccount, watchChainId, watchConnections, writeContract } from '@wagmi/core';
import { arbitrum, Chain, fantom, base, baseSepolia, fantomTestnet, goerli, mainnet, 
  sepolia, polygon, bsc, bscTestnet, celo, celoAlfajores,  fraxtal,fraxtalTestnet,
  hardhat, metisGoerli, etherlinkTestnet, shardeumSphinx,  
  defichainEvmTestnet, morphHolesky,
  coreDao,
  aurora,
  auroraTestnet} from '@wagmi/core/chains';
import { getAccount, readContract,    getPublicClient, getWalletClient} from '@wagmi/core';

import {erc20Abi} from 'viem'


import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';


import { FallbackTransport, formatUnits, http, parseUnits } from 'viem';
import { type GetChainIdReturnType } from '@wagmi/core'
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import {Web3Modal, authConnector, createWeb3Modal } from '@web3modal/wagmi';
import { core_testnet, dChainTestnet, opencampus, galadriel_devnet, neo_x_testnet } from './extra-chains';

const projectId = environment.walletConnectProjectId;

const metadata = {
  name: 'PopCoin',
  description: 'PopCoin - Meme Coin Launchpad',
  url: 'https://popcoin.fun/', // url must match your domain & subdomain
  icons: ['https://popcoin.fun/assets/logo.png']
}

const supportedChains:[Chain, ...Chain[]] = [hardhat,  mainnet, sepolia, baseSepolia, base, etherlinkTestnet, shardeumSphinx, 
  fraxtal, fraxtalTestnet, dChainTestnet, fantom, fantomTestnet,galadriel_devnet, opencampus, celoAlfajores, 
  opencampus, core_testnet, morphHolesky, neo_x_testnet,  auroraTestnet, aurora ]
//@ts-ignore
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    // walletConnect({ projectId: projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    }),
    authConnector({
      chains: supportedChains,
      options: { projectId },
      email: true, // default to true
      socials: ['google', 'x', 'github', 'discord', 'apple'],
      showWallets: true, // default to true
      walletFeatures: true // default to true
    })

  ],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [etherlinkTestnet.id]: http(),
    [shardeumSphinx.id]: http(),
    [fraxtal.id]: http(),
    [fraxtalTestnet.id]: http(),
    [dChainTestnet.id]: http(),
    [fantom.id]: http(),
    [fantomTestnet.id]: http(),
    [celoAlfajores.id]: http(),
    [celo.id]: http(),
    [coreDao.id]: http(),
    [core_testnet.id]: http(),
    [opencampus.id]: http(),
    [galadriel_devnet.id]: http(),
    [morphHolesky.id]: http(),
    [neo_x_testnet.id]: http(),

    [aurora.id]: http(),
    [auroraTestnet.id]: http(),
  },
})

export const chains: Record<number, Chain> = {
  1: mainnet,
  84532: baseSepolia,
  8453: base,
  11155111: sepolia,
  128123: etherlinkTestnet,
  8082: shardeumSphinx,
  31337: hardhat,
  252: fraxtal,
  2522: fraxtalTestnet,
  2713017997578000: dChainTestnet,
  4002: fantomTestnet,
  250: fantom,
  1116: coreDao,
  1115: core_testnet,
  42220: celo,
  44787: celoAlfajores,
  656476: opencampus,
  696969:  galadriel_devnet,
  2810: morphHolesky,
  12227332: neo_x_testnet,
  1313161554: aurora,
  1313161555: auroraTestnet


} 

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  
  w3modal?: Web3Modal;

  private _chainId$ = new BehaviorSubject<number|undefined>(undefined);
  
  public chainId$ = this._chainId$.asObservable()

  public get chainId(){
    
    return this._chainId$.value;
  }

  private _account$ = new BehaviorSubject<string|undefined>(undefined);
  
  public account$ = this._account$.asObservable()

  public get account(){
    
    return this._account$.value;
  }

  private _w3mState$ = new BehaviorSubject<{open?: boolean,selectedNetworkId?: number}|undefined>(undefined);
  
  public w3mState$ = this._w3mState$.asObservable()

  public get w3mState(){
    
    return this._w3mState$.value;
  }

  unwatchAccount : any;

  unwatchNetwork : any;

  // private _connected$ = new BehaviorSubject<boolean|undefined>(undefined);
  
  // public connected$ = this._connected$.asObservable()

  // public get connected(){
    
  //   return this._connected$.value;
  // }

  // unwatchConnection : any;


  constructor() {
    const w3m = createWeb3Modal({
      wagmiConfig: wagmiConfig,
      projectId: projectId,
      enableAnalytics: true, // Optional - defaults to your Cloud configuration
      enableOnramp: true, // Optional - false as default
      themeVariables: {
        // '--w3m-color-mix': '#a612a6',
        // '--w3m-color-mix-strength': 60,
        // '--w3m-accent' : '#a612a6'
      }

    })

    reconnect(wagmiConfig);
    
    setTimeout(() => {
      



      
      this.w3modal=w3m
      w3m.subscribeState(newState => {
        
        this._w3mState$.next(newState)
      })

      setTimeout(async ()=>{
        
          
        const {address, isConnected} = getAccount(wagmiConfig);
        if(isConnected){
          this._account$.next(address)
        }
                
        const chainId   = getChainId(wagmiConfig);
        if(chainId ){
          
          this._chainId$.next(chainId );
        }

        //Update chainId on change
        this.unwatchNetwork = watchChainId(wagmiConfig,      
          {
            onChange:  async (chainId) => {
              
              if(chainId ){
                
                this._chainId$.next(chainId );

              }else{
                this._chainId$.next(undefined);
              }
            },
          }
        ); 
        
        this.unwatchAccount = watchAccount(wagmiConfig, {
          onChange: (account) => {
            if(account && account.isConnected){
              this._account$.next(account.address);
            }else{
              this._account$.next(undefined);
            }
            
          }
        })
        
        
          
      }, 250)
    }, 200);
    
  }


  async getAccountInfo() {
    return getAccount(wagmiConfig);
  }

  getCurrentChainId() {
    const c: GetChainIdReturnType = getChainId(wagmiConfig);
    return c;
  }

  getCurrentChainNativeCoin() {
    const c: GetChainIdReturnType = getChainId(wagmiConfig);
    return chains[c].nativeCurrency
  }

  getChainName(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain.name
    }else{
      return undefined
    }

  }

  getChain(chainId: number){
    const chain = chains[chainId]
    if(chain){
      return chain
    }else{
      return undefined
    }

  }

  async getDateFromBlockNumber(blockNumber: number,chainId?: any){
    const block = await getBlock(wagmiConfig, {
      blockNumber: BigInt(blockNumber),
      chainId
    })
    if(block){
       // Convert the block's timestamp to a Date object
      const blockDate = new Date((+block.timestamp.toString()) * 1000);
      return blockDate;
    }else{
      return undefined
    }

  }

  
  async getERC20Balance(tokenAddress?: string, account?: string) {
    
    return await getBalance(wagmiConfig, {
      address: account as `0x${string}`,      
      token: tokenAddress as `0x${string}`
    });
  }
 


  async getERC20Allowance(tokenAddress: string|`0x${string}`, contractToApprove: string|`0x${string}`, account?: string|`0x${string}`,
   chainId? :any) {

    if(!account){
      account=this.account;
    }
    
    
    //@ts-ignore
    const allowance = await readContract(wagmiConfig, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      functionName: 'allowance',
      args: [account as `0x${string}`, contractToApprove as `0x${string}`],
      chainId
    })
    
    return allowance;
  }


  async approveERC20Contract(tokenAddress: string, contractToApprove: string, 
    account: string, amount: bigint, chainId? :any){

    
    //@ts-ignore
    // const simu = await simulateContract(wagmiConfig, {
    //   address: tokenAddress as `0x${string}`,
    //   abi: erc20Abi,      
    //   account: account as `0x${string}`,
    //   functionName: 'approve',
    //   args: [ contractToApprove as `0x${string}`, amount],
    //   chainId
    // })
 
    //@ts-ignore
    return await writeContract(wagmiConfig,{
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,      
      account: account as `0x${string}`,
      functionName: 'approve',
      args: [ contractToApprove as `0x${string}`, amount],
      chainId
    });

    
  }

  async signLoginMessage( nonce: any) {
    const signature = await signMessage(wagmiConfig,{
      message: `Login to PopCoin: ${nonce}`
    });
    return signature;
  }

  // async fetchTotalSupply(tokenAddress: string){
  //   const t= await this.getTokenInfo(tokenAddress as `0x${string}`)
  //   if(t){
  //     return t.totalSupply.value
  //   }

  //   return undefined
  // }
}



