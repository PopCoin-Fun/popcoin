import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../services/api.service';
import { AppToastService } from '../../services/app-toast.service';
import { Web3Service, chains, wagmiConfig } from '../../services/web3.service';
import { NgIf, AsyncPipe, NgClass, CommonModule } from '@angular/common';
import { ToastsComponent } from '../../toasts/toasts.component';
import { formatUnits, parseAbiItem, parseUnits } from 'viem';
import { getPublicClient, readContract, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { contractList } from '../../models/contract-list';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { calcInitialTokens } from '../../utils/calculateTokens';
import { newsCountries } from '../../models/news-countries';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Blockchain } from '../../models/blockchain';
import { KycService } from '../../services/kyc.service';
import { neo_x, neo_x_testnet } from '../../services/extra-chains';

const PopCoinFactoryABI = require( "../../../assets/abis/pop-coin-factory.json");

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule, NgbTooltipModule, ToastsComponent, NgIf, AsyncPipe,FormsModule ,  
    ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  ngxSpinner = inject(NgxSpinnerService);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  toastService = inject(AppToastService)

  createTokenForm: FormGroup;
  
  initialBuyTokenAmountSubscription?: Subscription;
  initialBuyToken: number = 0;

  creationFee : any;

  routers: any

  // countries: {
  //   code: string;
  //   name: string;
  // }[]
  // selectedCountry : any ; 

  // news: any;
  blockchain?: Blockchain;
  currentChainName?: string;
  requiresKyc = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private kycService: KycService
  ) {

    // this.countries = newsCountries
    // this.countries.sort((a,b)=> a.code.charCodeAt(0) - b.code.charCodeAt(0))
    // this.selectedCountry = this.countries.find(country => country.code === 'ng') ;
    // this.getNews('ng');

    if(environment.production){
      this.createTokenForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        symbol: ['', [Validators.required, Validators.maxLength(9)]],
        description: ['', [ Validators.maxLength(600)]],
        initialBuyInEth: ['0', [Validators.required, Validators.min(0), Validators.max(1000000)]],
        router: ['', [Validators.required]],
        coinLogo: ['https://picsum.photos/id/237/200/300', [Validators.required]],  // Valid URL for image  // , Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        coinBanner: ['https://picsum.photos/id/237/300/300', [Validators.required]], // Valid URL for image   //, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        twitter: ['', [ Validators.pattern(/^https:\/\/twitter\.com\/([a-zA-Z0-9_]{1,15})$/)]], // Valid Twitter URL
        telegram: ['', [ Validators.pattern(/^https?:\/\/(t\.me|telegram\.me|telegram\.org)\/[a-zA-Z0-9_]{1,50}$/)]], // Valid Telegram URL
        website: ['', [ Validators.pattern(/^(https?:\/\/[^\s/$.?#].[^\s]*)$/)]], // Valid URL
      });
    }else{
      this.createTokenForm = this.fb.group({
        name: ['TKNG', [Validators.required, Validators.minLength(3)]],
        symbol: ['TKNG', [Validators.required, Validators.maxLength(9)]],
        description: ['Premium meme coin', [ Validators.maxLength(600)]],
        initialBuyInEth: ['1', [Validators.required, Validators.min(0), Validators.max(1000000)]],
        router: ['', [Validators.required]],
        
        coinLogo: ['/assets/img/memepepe1.jpeg', [Validators.required]],  // Valid URL for image  // , Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        coinBanner: ['/assets/img/memepepe1.jpeg', [Validators.required]], // Valid URL for image   //, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        twitter: ['', [ Validators.pattern(/^https:\/\/twitter\.com\/([a-zA-Z0-9_]{1,15})$/)]], // Valid Twitter URL
        telegram: ['', [ Validators.pattern(/^https?:\/\/(t\.me|telegram\.me|telegram\.org)\/[a-zA-Z0-9_]{1,50}$/)]], // Valid Telegram URL
        website: ['https://www.meme.com', [ Validators.pattern(/^(https?:\/\/[^\s/$.?#].[^\s]*)$/)]], // Valid URL
      });
    }

    
    
    
  }

  
  

  async ngOnInit() {

    this.web3Service.chainId$.subscribe(async (chainId)=>{
      if(chainId){
        this.currentChainName = chains[chainId].name
        this.routers= contractList[this.web3Service.chainId!].routers
        try {
          this.blockchain = await this.apiService.getBlockChain(chainId);
        }catch(err){
          console.error('Error getting blockchain: ', err)
        }
        

        if(!this.blockchain){
          console.error('Error getting blockchain')
        }

        if(this.web3Service.chainId && (+this.createTokenForm.get('initialBuyInEth')?.value??0)>0){
          this.initialBuyToken=calcInitialTokens(this.web3Service.chainId!,this.blockchain, this.createTokenForm.get('initialBuyInEth')?.value);
        }
        
        this.initialBuyTokenAmountSubscription =  this.createTokenForm.get('initialBuyInEth')!.valueChanges.subscribe(async (val:number) => {
          if(val >=0) {
            this.initialBuyToken=calcInitialTokens(this.web3Service.chainId!,this.blockchain,val);
          } 
                
        })
        
        this.creationFee = await readContract(wagmiConfig, {
          address: this.blockchain?.contractAddress as any,
          abi: PopCoinFactoryABI,
          functionName: 'tokenCreateFee',
          args: [],
          chainId: chainId
        })

        
        

      }
    })

    // this.web3Service.account$.subscribe(async acct=>{
    //   if(acct){
    //     this.createTokenForm.disable()

    //     this.requiresKyc =  ! (await this.kycService.checkAttestation(acct))
    //     if(this.requiresKyc!==true){
    //       this.createTokenForm.enable()
    //     }
    //   }
    // })

    
  }

  ngOnDestroy(){
    if(this.initialBuyTokenAmountSubscription){
      this.initialBuyTokenAmountSubscription.unsubscribe();
      this.initialBuyTokenAmountSubscription=undefined
    }
    
  }

  formatUnits(v: any){
    return formatUnits(v,18)
  }

  // onNewsCountryChange(event: any): void {
  //   const selectedCode = event.target.value;
  //   const selectedCountry = this.countries.find(country => country.code === selectedCode);
  //   console.log('selected: ', selectedCountry)
  //   this.getNews(selectedCode);
  // }

  
  // getNews(selectedCode: string){
  //   this.apiService.getTrendingNews(selectedCode).subscribe((newsResult: any)=>{
  //     this.news = newsResult.results
  //   })
  // }

  async onSubmit() {
    

    if (this.createTokenForm.invalid || !this.blockchain) {
      
      return;
    }

    this.ngxSpinner.show();

    const { name, symbol,description, initialBuyInEth,router, fee, coinLogo, coinBanner, twitter, telegram, website } = this.createTokenForm.value;

    try {
      // Convert initial buy-in and fee to wei (assuming they are provided in ETH)
      const initialBuyInWei = parseUnits(initialBuyInEth, 18);
      
      const gasPrice = [neo_x.id,neo_x_testnet.id].some(ss=>ss== this.web3Service.chainId) ? 40000000000n: undefined;

      const simulateContractResult  = await simulateContract(wagmiConfig, {
        address: this.blockchain?.contractAddress as any,
        abi: PopCoinFactoryABI,
        functionName: 'createToken',
        args: [
          {
            banner: coinBanner,
            logo: coinLogo,
            description,
            initialCreatorBuy: initialBuyInWei,
            name,
            symbol,
            routerAddress: router,
            telegram,
            twitter,
            website,
          
          }
          // name,
          // symbol,
          // initialBuyInWei,
          // router
        ],
        value: this.creationFee + initialBuyInWei, 
        gasPrice: gasPrice
      })
      // if(simulateContractResult.request)
      const hash = await writeContract(wagmiConfig, simulateContractResult.request)

      // console.log('hash : ', hash)

      const receipt = await waitForTransactionReceipt(wagmiConfig, {hash})

      const pc = getPublicClient(wagmiConfig)
          
      //@ts-ignore
      const logs: WagmiEventLog[] = await pc.getLogs({  
        address: this.blockchain.contractAddress as any,
        event: parseAbiItem('event TokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol, string description, string logo, string banner, string twitter, string telegram, string website, address routerAddress, uint256 timestamp)'),
        args: {          
          
        },
        blockHash: receipt.blockHash,
        // fromBlock: receipt.blockNumber,
        // toBlock: receipt.blockNumber + 1n
      });

      // console.log('logs: ', logs[0].args)
      const newTokenAddress = logs[0].args.tokenAddress.toString()
      const newTokenCreator = logs[0].args.creator.toString()
      const routerAddress = logs[0].args.routerAddress.toString()
      const chainId= this.web3Service.chainId!
      // console.log(newTokenAddress, newTokenCreator)

      this.apiService.notifyCoinCreateSuccess(chainId,receipt.blockNumber, { 
        name, 
        symbol,  
        logo: coinLogo, 
        banner: coinBanner,
        description, 
        twitter, 
        telegram, 
        website ,
        routerAddress,
        creator: newTokenCreator,
        address: newTokenAddress,
        initialBuyInEth,
        initialBuyTokens: calcInitialTokens(chainId,this.blockchain, initialBuyInEth),
        txHash: hash
      } ).subscribe({
        next: async (resp: any)=>{
          this.ngxSpinner.hide();
          this.toastService.show("Success", "Token Created Successfully")

          this.router.navigate(['coins', resp.id ])
        },
        error:(err)=>{
          this.toastService.error("Token Created But ...", "Token Created Successfully but a process is still ungoing, Check back in 5 minutes under 'My Coins'")
          this.router.navigate(['coins', `${newTokenAddress}-${chainId}` ])
          
          this.ngxSpinner.hide();
          console.debug("Error sending Token details to server", err)
        }
      })
      

      

      //redirect

    } catch (error: any) {
      console.error('Token creation failed:', error);
      
      this.ngxSpinner.hide();
      if(error.message.includes('OutOfFund')){
        this.toastService.error("Error Creating Token", "Wallet out of funds. Not enough Coins for the transaction fee")
      }
      else if(error.message.includes('InsufficientPayment')){
        this.toastService.error("Error Creating Token", "Not enough Coins to pay the token creation fee")
      }
      else {
        this.toastService.error("Error Creating Token", "There was an error creating the Token, pls try again later.")
      }
      
      console.error('Token creation failed:', JSON.stringify(error));
      // this.errorMessage = error.message || 'Transaction failed';
    }

    
  }

}
