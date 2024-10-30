import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../services/api.service';
import { AppToastService } from '../../services/app-toast.service';
import { Web3Service, chains, wagmiConfig } from '../../services/web3.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { getBalance, readContract, readContracts, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { erc20Abi, formatEther, formatUnits, parseEther } from 'viem';
import { AsyncPipe, CommonModule, DecimalPipe, NgClass, isPlatformBrowser } from '@angular/common';
import { NgbNavModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { chainLogos } from '../../models/coin-logos';
import { contractList } from '../../models/contract-list';
import { Subscription } from 'rxjs';
import { type SimulateContractErrorType } from '@wagmi/core'
import { CommentItemComponent } from '../../components/comment-item/comment-item.component';
import { AuthService } from '../../services/auth.service';
import { IChartApi, createChart } from 'lightweight-charts';
import { convertToCandlestick } from '../../utils/candle-sticks';
import { platform } from 'os';
import { environment } from '../../../environments/environment';
import { Blockchain } from '../../models/blockchain';
import { start } from 'repl';
import { patchableSignal } from '../../models/patchable-signal';
import { Coin } from '../../models/coin';
import { neo_x, neo_x_testnet } from '../../services/extra-chains';

const CHART_PRICE_MULTIPLIER = 1000000000000
let chainNativeCurrencySymbol='ETH'



const PopCoinFactoryABI = require( "../../../assets/abis/pop-coin-factory.json");
const FunTokenABI = require( "../../../assets/abis/fun-token.json");

@Component({
  selector: 'app-coin-details',
  standalone: true,
  imports: [DecimalPipe, CommonModule, NgbNavModule, AsyncPipe, NgbProgressbarModule,  ReactiveFormsModule, NgClass, CommentItemComponent],
  templateUrl: './coin-details.component.html',
  styleUrl: './coin-details.component.scss'
})
export class CoinDetailsComponent {
  @ViewChild('tradingViewElement') tradingViewElement!: ElementRef;
  ngxSpinner = inject(NgxSpinnerService);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  toastService = inject(AppToastService)

  createTokenForm: FormGroup;

  buyForm: FormGroup;
  sellForm: FormGroup;
  commentForm: FormGroup;
  

  creationFee : any;

  coinId?: string;

  coinErrored=false
  

  coin = patchableSignal<Coin>({} as Coin);
  marketCap: any = 0;
  marketCapUSD: any = 0;
  marketCapSymbol?: string = "frxETH";

  chainLogo = 'https://cryptologos.cc/logos/frax-finance-frax-ether-frxeth-logo.png?v=032'
  chainNativeCurrencySymbol = 'frxETH';
  chainName: string = ''

  buyFormAmountSubscription?: Subscription;
  sellFormAmountSubscription?: Subscription;

  comments: any
  trades: any
  holders: any

  tradingViewInterval = 30 * 60 * 1000;

  buyTokensResult: any
  sellTokensResult: any;

  nativeCoinBalance: any;
  tokenBalance: any;

  totalCoinsHeldByTraders: number=0;
  coinsHeldByBondingCurve: number=0;
  bondingCurveProgress: number = 0;

  dexAddress?: string;
  dex: any

  blockchain?: Blockchain;

  transactionFee: number=0.01;
  slippage = 3;

  migrationThreshold = 30;
  ethReserve = 0;
  tokenReserve = 100000000;

  scanAddress? : string;

  intervalId: any

  mySignal = signal<{name?:string, value: number}>({name: undefined, value:0})
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authServce: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.buyForm = this.fb.group({
      amount: ['0', [Validators.required, Validators.min(0)]],
      comment: ['', [ Validators.maxLength(360)]],
    });

    this.sellForm = this.fb.group({
      amount: ['0', [Validators.required, Validators.min(0)]],
      comment: ['', [ Validators.maxLength(360)]],
    });

    this.commentForm = this.fb.group({
      comment: ['', [ Validators.required, Validators.maxLength(360)]],
    });

    this.buyFormAmountSubscription =  this.buyForm.get('amount')!.valueChanges.subscribe(async (val:number) => {
      if(val >=0) {
        this.buyTokensResult = formatEther( (await readContract(wagmiConfig,{
          address: this.blockchain?.contractAddress as any,
          abi: PopCoinFactoryABI,
          functionName: 'calcAmountOutFromEth',
          args:[
            this.coin().address,
            parseEther(val.toString()) 
          ],
          chainId: this.coin().chainId
        })) as any )
      }else{
        this.buyTokensResult =undefined
      }
            
    })

    this.sellFormAmountSubscription =  this.sellForm.get('amount')!.valueChanges.subscribe(async (val:number) => {
      if(val >=0) {
        this.sellTokensResult = formatEther( (await readContract(wagmiConfig,{
          address: this.blockchain?.contractAddress as any,
          abi: PopCoinFactoryABI,
          functionName: 'calcAmountOutFromToken',
          args:[
            this.coin().address,
            parseEther(val.toString()) 
          ],
          chainId: this.coin().chainId
        })) as any )
      }else{
        this.sellTokensResult =undefined
      }
            
    })

    this.createTokenForm = this.fb.group({
      name: ['TKNA', [Validators.required, Validators.minLength(3)]],
      symbol: ['TKNA', [Validators.required, Validators.maxLength(9)]],
      description: ['Premium meme coin', [ Validators.maxLength(600)]],
      initialBuyInEth: ['1', [Validators.required, Validators.min(0), Validators.max(10)]],
      
      coinLogo: ['https://picsum.photos/id/237/200/300', [Validators.required]],  // Valid URL for image  // , Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
      coinBanner: ['https://picsum.photos/id/237/300/300', [Validators.required]], // Valid URL for image   //, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
      twitter: ['', [ Validators.pattern(/^https:\/\/twitter\.com\/([a-zA-Z0-9_]{1,15})$/)]], // Valid Twitter URL
      telegram: ['', [ Validators.pattern(/^https?:\/\/(t\.me|telegram\.me|telegram\.org)\/[a-zA-Z0-9_]{1,50}$/)]], // Valid Telegram URL
      website: ['https://www.meme.com', [ Validators.pattern(/^(https?:\/\/[^\s/$.?#].[^\s]*)$/)]], // Valid URL
    });
  }

  async ngOnInit(){
    this.route.params.subscribe((params: Params) => {
      this.coinId = params['coinId']!;

      // setTimeout(async ()=>{
      //   const tc = await readContract(wagmiConfig,
      //     {
      //       address: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", //contractList[this.web3Service.chainId!].contract as any,
      //       abi: PopCoinFactoryABI,
      //       functionName: 'tokenCreators',
      //       args: ['0x7e2d5FCC5E02cBF2b9f860052C0226104E23F9c7'],
      //       chainId: 31337
      //     }
      //   ) 

      //   console.log('tc:', tc)
      // }, 400)

      this.apiService.getCoin(this.coinId??'').subscribe(
        {
          next: async (coin)=>{

            this.coinErrored=false
              console.log('coin:', coin)
              this.mySignal.update((init)=>{return {...init,name: 'Boye'}} )
              this.coin.patch(coin);
      
              this.updateMarketCap().then(()=>{});
      
              this.blockchain = await this.apiService.getBlockChain(this.coin().chainId);
              
              this.chainLogo= chainLogos[this.coin().chainId]
              this.chainName = chains[this.coin().chainId].name
              this.chainNativeCurrencySymbol = chains[this.coin().chainId].nativeCurrency.symbol
              
              chainNativeCurrencySymbol=this.chainNativeCurrencySymbol
            
              this.dexAddress= this.coin().routerAddress; 

              // console.log('TxFeePercent: ', 1, this.blockchain?.contractAddress )
      
              const [txFeePercent, threshold, tokenPoolResult] = await readContracts(wagmiConfig,
                {
                  contracts: [ 
                    {
                      address: this.blockchain?.contractAddress as any, //contractList[this.web3Service.chainId!].contract as any,
                      abi: PopCoinFactoryABI,
                      functionName: 'transactionFeePercent',
                      args: [],
                      chainId: this.coin().chainId
                    },
                    {
                      address: this.blockchain?.contractAddress as any, //contractList[this.web3Service.chainId!].contract as any,
                      abi: PopCoinFactoryABI,
                      functionName: 'migrationThreshold',
                      args: [],
                      chainId: this.coin().chainId
                    },
                    {
                      address: this.blockchain?.contractAddress as any, //contractList[this.web3Service.chainId!].contract as any,
                      abi: PopCoinFactoryABI,
                      functionName: 'tokenPool',
                      args: [this.coin().address],
                      chainId: this.coin().chainId
                    }
                  ],
                  multicallAddress: contractList[this.coin().chainId].multicall3
                }
              ) 
           
              if(threshold.result){
                this.migrationThreshold = +formatEther(threshold.result as bigint);
              }else{
                this.migrationThreshold = 28.335119685602000714;
              }

              const tokenPool = tokenPoolResult.result as any
              this.ethReserve = +formatEther(tokenPool[3] as bigint)  
              this.tokenReserve = +formatEther(tokenPool[1] as bigint)  
      
              this.transactionFee =  +((txFeePercent.result as any).toString()) / 10000
              
              this.scanAddress = chains[this.coin().chainId].blockExplorers?.default.url
              this.dex = contractList[this.coin().chainId].routers.find(ff=>ff.address==this.dexAddress)
              // console.log('dex is ', this.dex)
      
              this.getComments();
              this.getHolders();
              await this.loadTrades()
              if(isPlatformBrowser(this.platformId)){
                setTimeout(async ()=>{
                  
                  await this.updateNativeCoinBalance();
                  await this.updateTokenBalance();
                  // console.log('tradin elemtn', this.tradingViewElement.nativeElement )
                  if(this.tradingViewElement && this.tradingViewElement.nativeElement){
                    this.initializeChart();
                  }
      
                  this.intervalId=setInterval(async ()=>{
                    
                    this.getHolders();
                    this.getTrades()
                  }, 15*1000)
                  
                },3000)
              }
      
              
              
      
            
          }, 
          error:(err)=>{
            this.coinErrored=true
            if(isPlatformBrowser(this.platformId)){
              setTimeout(async ()=>{
                this.toastService.error('Coin Not found!', 'Coin Not found')
                
              },3000)
            }
            
          }
        }  
      )



    })
  }

  ngOnDestroy(){
    if(this.buyFormAmountSubscription){
      this.buyFormAmountSubscription.unsubscribe();
      this.buyFormAmountSubscription=undefined
    }
    if(this.sellFormAmountSubscription){
      this.sellFormAmountSubscription.unsubscribe();
      this.sellFormAmountSubscription=undefined
    }
    if(this.intervalId){
      clearInterval(this.intervalId)
    }
  }

  chart?: IChartApi;
  candlestickSeries: any;

  // Custom price formatter function
  customPriceFormatter(price: number) {    
    const formatted = `${(price / CHART_PRICE_MULTIPLIER).toFixed(12)} ${chainNativeCurrencySymbol}`;
    return formatted;
  }

  initializeChart(){
    this.chart = createChart("tradingViewElement", { 
      // width: 600, 
      height: 300 ,
      timeScale: {
        timeVisible:true,
        secondsVisible:false,
        
      },
      autoSize: true,
      // leftPriceScale: {
      //   autoScale: false,

      // }
    });

    

    this.candlestickSeries = this.chart.addCandlestickSeries({
      priceFormat: {
        type: 'custom',
        formatter: this.customPriceFormatter,
      },
    });
    // console.log('trades:', this.trades)
    if(this.trades){
      const candles = convertToCandlestick(this.trades, this.tradingViewInterval)
      // console.log('candles:', candles)
      //{ time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
      this.candlestickSeries.setData(candles);
    }

  }

  

  async updateNativeCoinBalance(){
    if(this.web3Service.account){
      const balance = await getBalance(wagmiConfig, {
        address: this.web3Service.account as any,
        chainId: this.coin().chainId,

      })
      if(balance && balance.value>0n){
        this.nativeCoinBalance = formatEther(balance.value)
      }
    }
  }

  async updateTokenBalance(){
    if(this.web3Service.account){
      const balance = await getBalance(wagmiConfig, {
        address: this.web3Service.account as any,
        chainId: this.coin().chainId,
        token: this.coin().address as any

      })
      if(balance && balance.value>0n){
        this.tokenBalance = formatEther(balance.value)
      }
    }
  }

  async updateMarketCap(){
    // const ethBalance = await getBalance(wagmiConfig, {
    //   address: this.coin().address,
    //   chainId: this.coin().chainId
    // })
    // console.log('ethBalance', ethBalance)
    this.marketCap =  this.coin().marketCap; // formatUnits( ethBalance.value, ethBalance.decimals);
    this.marketCapSymbol= chains[this.coin().chainId].nativeCurrency.symbol; // ethBalance.symbol
    this.marketCapUSD = +this.marketCap/this.coin().usdRate // await this.apiService.convertETHtoUSD(+this.marketCap)
    
  }

  async getComments(){
    if(!this.coinId) return;

    this.apiService.getCoinComments(this.coinId).subscribe((comments:any)=>{
      this.comments=comments.results;
    })
  }

  
  async getHolders(){
    if(!this.coinId) return;

    this.apiService.getCoinHolders(this.coinId).subscribe(async (holders:any)=>{
      // this.holders=holders.results;
      // console.log('holders:',holders)

      
      this.totalCoinsHeldByTraders = 0;
      // this.holders=holders.results.map(async (m:any)=>{
      //   let h = {
      //     holder: m,
      //     balance: 0
      //   }
      //   const balance =  await getBalance(wagmiConfig, {
      //     address: m,
      //     chainId: this.coin().chainId,
      //     token: this.coin().address
      //   })
      //   console.log('balance:',balance)
      //   h.balance = +balance.formatted
      //   totalHeld+=h.balance;

      //   console.log('h:',h, ', totalheld:', totalHeld)
      //   return h;
      // })

      this.holders=[];
      for (let index = 0; index < holders.results.length; index++) {
        let holder = holders.results[index];
        let h = {
          holder: holder,
          balance: 0
        }
        const balance =  await getBalance(wagmiConfig, {
          address: holder,
          chainId: this.coin().chainId,
          token: this.coin().address as any
        })
        // console.log('balance:',balance)
        h.balance = +balance.formatted
        this.totalCoinsHeldByTraders+=h.balance;
        
        this.holders.push(h)
      }
      

      if(this.coin().isMigrated===true){
        this.coinsHeldByBondingCurve=0;
        this.bondingCurveProgress = 100
      }else{
        this.coinsHeldByBondingCurve=793100000 - this.totalCoinsHeldByTraders;
        this.bondingCurveProgress = (this.totalCoinsHeldByTraders/793100000) * 100
      }
      
    })
  }

  
  async getTrades(){
    
    if(!this.coinId) return;

    this.apiService.getCoinTrades(this.coinId).subscribe(async (tradesResult:any)=>{
      // console.log('tradesResult', tradesResult)
      // const trades=tradesResult.results;
      if(tradesResult.results.length>0){
        this.trades=[
          {
            "id": "first",
            "tokenAddress": this.coin().address,
            "coinId": this.coinId,
            "trader": "trader0",
            "traderUserId": 24,
            "traderUserDisplayName": "yuga1",
            "traderUserDisplayPicture": "https://localhost:5001/profiles/06202024_010456.jpg",
            "tradeType": 0,
            "tokenTraded": 0,
            "amountPaid": 0,
            "blockNumber": 78,
            "transactionHash": "0x594cf3c19001bdf76292ed4e0671b2884603540b2b04d077988f21e7818981f5",
            "timestamp": new Date(this.coin().createdOn)
          }
        ]
      }else{
        this.trades=[]
      }
      
      
      for (let index = 0; index < tradesResult.results.length; index++) {
        let trade = tradesResult.results[index];
        trade.timestamp = await this.web3Service.getDateFromBlockNumber(trade.blockNumber, trade.chainId)
        this.trades.push(trade)
      }
      
      // console.log('TRDSTICK:  ' , this.candlestickSeries)
      try{
        let candles = convertToCandlestick(this.trades, this.tradingViewInterval)
        // console.log('candles:  ', candles)
        candles = candles.map(c=> {
          return {
            open: c.open * CHART_PRICE_MULTIPLIER,
            close: c.close * CHART_PRICE_MULTIPLIER,
            high: c.high * CHART_PRICE_MULTIPLIER,
            low: c.low * CHART_PRICE_MULTIPLIER,
            time:c.time,
            startTime: c.startTime,
            endTime: c.endTime,
            volume: c.volume
          }
        })
        // console.log('candles 2',candles)
        //{ time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
        this.candlestickSeries.setData(candles);
        this.chart?.timeScale().fitContent();
                
      }catch(err){
        console.error('Error Candle:', err)
      }
    })

    try{
      if(this.coin().address && this.coin().address.length>10){
        const tokenPool = (await readContract(wagmiConfig, {
            address: this.blockchain?.contractAddress as any, //contractList[this.web3Service.chainId!].contract as any,
            abi: PopCoinFactoryABI,
            functionName: 'tokenPool',
            args: [this.coin().address as any],
            chainId: this.coin().chainId
          }
        )) as any;

        
        if(tokenPool){
          this.ethReserve = +formatEther(tokenPool[3]as bigint)  // ethReserve
          this.tokenReserve = +formatEther(tokenPool[4] as bigint)//tokenReserve
          
          this.coin().isMigrated = tokenPool[11];
        }
    
        
      }
    }catch(err){
      console.error('Error parsing tokenPool', err)
    } 
  }

  async loadTrades(){
    
    if(!this.trades){
      // console.log('loading trades')
      await this.getTrades();
    }
  }


  async onBuy(){
    if(!this.authServce.hasLoggedIn() || !!!this.web3Service.account){
      this.toastService.error("Login First","Login with your wallet first")
      return;
    }

    const amount = +this.buyForm.get('amount')?.value

    if(amount<=0){
      this.toastService.error("Invalid Amount","Enter an amount greater than 0")
      return;
    }

    this.ngxSpinner.show();
    
    // if(simulResult.)
    try{

      // let amountOut: any = await readContract(wagmiConfig, {
      //   address: this.blockchain?.contractAddress as any,
      //   abi: PopCoinFactoryABI,
      //   functionName: 'calcAmountOutFromEth',
      //   args: [
      //     this.coin().address,
      //     parseEther( amount.toString())
      //   ],
      //   chainId: this.coin().chainId,
      // })
      let amountOut = parseEther(this.buyTokensResult)
      const amountOutMin = amountOut -(amountOut * BigInt(this.slippage) / BigInt("100"));
      const gasPrice = [neo_x.id,neo_x_testnet.id].some(ss=>ss== this.web3Service.chainId) ? 40000000000n: undefined;
      const simulResult = await simulateContract(wagmiConfig, {
        address: this.blockchain?.contractAddress as any,
        abi: PopCoinFactoryABI,
        functionName: 'swapEthForTokens',
        args: [
          this.coin().address,
          parseEther( amount.toString()),
          amountOutMin,
          new Date().getTime() + 2*60 * 1000
        ],
        chainId: this.coin().chainId,
        value : parseEther( (amount + (this.transactionFee * amount)).toString()  ),
        gasPrice
      })

      const hash = await writeContract(wagmiConfig,simulResult.request);
      const receipt = await waitForTransactionReceipt(wagmiConfig, {hash})
      if(receipt.status==='success'){
        if(this.buyForm.get('comment')?.value && this.buyForm.get('comment')?.value.length>0){
          this.apiService.addComment(this.coin().id, this.buyForm.get('comment')?.value, 0, amount).subscribe({
            next: ()=>{

            },
            error:(err: any) =>{
              console.error('Error adding comment:', err)
            }
          })
        }
        
        
        if(isPlatformBrowser(this.platformId)){
          setTimeout(async ()=>{
            this.updateMarketCap().then(async ()=>{
              this.getTrades();
              this.getComments();
              this.getHolders();

              await this.updateNativeCoinBalance();
              await this.updateTokenBalance();
            });
          },2000)
        }

        this.ngxSpinner.hide();
        this.toastService.show('Success','Coin Bought and sent to your wallet');
      }else{
        this.ngxSpinner.hide();
        this.toastService.error('Error','Coin Trade Failed');
      }
    }catch(error: any){
      // const err = error as SimulateContractErrorType;
      // err.stack
      // if(error is SimulateContractErrorType){

      // }
      console.error('Error::', error)
      console.error('Error message::', error.message)
      if (error.message.includes("LiquidityAlreadySent")) {
        // User rejected the transaction
        this.toastService.error('Coin Trade Failed','Coin Already sent to DEX, Trade on DEX');
        // You can display a message to the user here.
      }
      else if (error.message.includes("SlippageExceeded")) {
        this.toastService.error('Coin Trade Failed','Slippage Exceeded');
      }
      else if (error.message.includes("ExceededMaxBuy")) {
        this.toastService.error('Coin Trade Failed','Max Buy Exceeded');
      }
      else if (error.message.includes("InsufficientETH")) {
        this.toastService.error('Coin Trade Failed','Insufficient Sale Coin Provided');
      }
      else if (error.message.includes("InsufficientTokens")) {
        this.toastService.error('Coin Trade Failed','Insufficient Tokens in Contract');
      }
      else if (error.message.includes("InsufficientTokens")) {
        this.toastService.error('Coin Trade Failed','Insufficient Tokens in Contract');
      }
      else if (error.message.includes("insufficient funds")) {
          // Insufficient funds to complete the transaction
          console.error("Insufficient funds to complete the transaction.");
          // You can inform the user to add more funds to their wallet.
      } else {
        this.toastService.error('Error','An error occurred while processing the Sale Transaction');
        console.error("An error occurred while processing the transaction:", error.message);
          
      }

      this.ngxSpinner.hide();
    }
    

  }

  async onSell(){
    if(!this.authServce.hasLoggedIn() || !!!this.web3Service.account){
      this.toastService.error("Login First","Login with your wallet first")
      return;
    }

    const amount = +this.sellForm.get('amount')?.value

    if(amount<=0){
      this.toastService.error("Invalid Amount","Enter an amount greater than 0")
      return;
    }

    this.ngxSpinner.show();
    
    // if(simulResult.)
    try{

      //approve
      // get allowance
      const allowance = await readContract(wagmiConfig, {
        abi: erc20Abi,
        address: this.coin().address as any,
        functionName: 'allowance',
        args: [this.web3Service.account as any,this.blockchain?.contractAddress as any],
        chainId: this.coin().chainId
      });

      const gasPrice = [neo_x.id,neo_x_testnet.id].some(ss=>ss== this.web3Service.chainId)? 40000000000n: undefined;
      if(!allowance || allowance < parseEther(amount.toString()) ){
        const simulApprovResult = await simulateContract(wagmiConfig, {
          address: this.coin().address as any,
          abi: erc20Abi,
          functionName: 'approve',
          args: [
            this.blockchain?.contractAddress as any,
            parseEther( amount.toString()),
            //'1000000' // 10000% Max slippage - default
          ],
          chainId: this.coin().chainId,
          gasPrice
          // value : parseEther( (amount + (+contractList[this.coin().chainId!]!.transactionFee * amount)).toString()  )
        })
  
        const approveHash = await writeContract(wagmiConfig,simulApprovResult.request);
        const appproveReceipt = await waitForTransactionReceipt(wagmiConfig, {hash:approveHash})

        if(appproveReceipt.status!= 'success'){
          this.ngxSpinner.hide();
          this.toastService.error('Error','Approval Failed');
          return;
        }
      }


      // const amountOut: any = await readContract(wagmiConfig, {
      //   address: this.blockchain?.contractAddress as any,
      //   abi: PopCoinFactoryABI,
      //   functionName: 'calcAmountOutFromToken',
      //   args: [
      //     this.coin().address,
      //     parseEther( amount.toString())
      //   ],
      //   chainId: this.coin().chainId,
      // })
      let amountOut = parseEther(this.sellTokensResult)

      const amountOutMin = amountOut -(amountOut * BigInt(this.slippage) / BigInt("100"));

      // console.log('amountOut: ',amount, ', amtOutMin: ', formatEther(amountOutMin))

      const simulResult = await simulateContract(wagmiConfig, {
        address: this.blockchain?.contractAddress as any,
        abi: PopCoinFactoryABI,
        functionName: 'swapTokensForEth',
        args: [
          this.coin().address,
          parseEther( amount.toString()),
          amountOutMin,
          new Date().getTime() + 30*60 * 1000
        ],
        chainId: this.coin().chainId,
        gasPrice
        //value : parseEther( (amount + (this.transactionFee * amount)).toString()  )
      })

      const hash = await writeContract(wagmiConfig,simulResult.request);
      const receipt = await waitForTransactionReceipt(wagmiConfig, {hash})
      if(receipt.status==='success'){
        if(this.sellForm.get('comment')?.value && this.sellForm.get('comment')?.value.length>0){
          this.apiService.addComment(this.coin().id, this.sellForm.get('comment')?.value, 1, amount).subscribe({
            next: ()=>{

            },
            error:(err: any) =>{
              console.error('Error adding comment:', err)
            }
          })
        }
        
        if(isPlatformBrowser(this.platformId)){
          setTimeout(async ()=>{
            this.updateMarketCap().then(async ()=>{
              this.getTrades();
              this.getComments();
              this.getHolders();
              await this.updateNativeCoinBalance();
              await this.updateTokenBalance();
            });
          },2000)
        }
        this.ngxSpinner.hide();
        this.toastService.show('Success','Coin Sold Successfully');
      }else{
        this.ngxSpinner.hide();
        this.toastService.error('Error','Coin Trade Failed');
      }
    }catch(error: any){
      
      console.error('Error::', error)
      console.error('Error message::', error.message)
      if (error.message.includes("LiquidityAlreadySent")) {
        // User rejected the transaction
        this.toastService.error('Coin Trade Failed','Coin Already sent to DEX, Trade on DEX');
        // You can display a message to the user here.
      }
      else if (error.message.includes("SlippageExceeded") || error.message.includes("InsufficientOutput") ) {
        this.toastService.error('Coin Trade Failed','Slippage Exceeded');
      }
      else if (error.message.includes("ExceededMaxBuy")) {
        this.toastService.error('Coin Trade Failed','Max Sell Exceeded');
      }
      else if (error.message.includes("InsufficientETH")) {
        this.toastService.error('Coin Trade Failed','Insufficient Sale Coin Provided');
      }
      else if (error.message.includes("InsufficientTokens")) {
        this.toastService.error('Coin Trade Failed','Insufficient Tokens in Contract');
      }
      else if (error.message.includes("InsufficientTokens")) {
        this.toastService.error('Coin Trade Failed','Insufficient Tokens in Contract');
      }
      else if (error.message.includes("insufficient funds")) {
          // Insufficient funds to complete the transaction
          console.error("Insufficient funds to complete the transaction.");
          // You can inform the user to add more funds to their wallet.
      } else {
        this.toastService.error('Error','An error occurred while processing the Sale Transaction');
        console.error("An error occurred while processing the transaction:", error.message);
          
      }

      this.ngxSpinner.hide();
    }
  }

  onAddComment(){
    this.ngxSpinner.show();
    
    // if(simulResult.)
    try{
      const comment = this.commentForm.get('comment')?.value
      this.apiService.addComment(this.coin().id, comment).subscribe({
        next: ()=>{
          this.getComments();
          this.ngxSpinner.hide();
          this.toastService.show('Success','Comment submitted Successfully');
        },
        error:(err: any) =>{
          this.ngxSpinner.hide();
          this.toastService.error('Error','Error adding Comment');
          console.error('Error adding comment:', err)
        }
      })
    }catch(error: any){
      // const err = error as SimulateContractErrorType;
      // err.stack
      // if(error is SimulateContractErrorType){

      // }
      console.error('Error::', error)
      
      this.toastService.error('Error','An error occurred while processing the Sale Transaction');
        
      this.ngxSpinner.hide();
    }
  }
}
