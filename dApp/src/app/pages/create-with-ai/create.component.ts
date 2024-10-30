import { Component, Renderer2, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../services/api.service';
import { AppToastService } from '../../services/app-toast.service';
import { Web3Service, chains, wagmiConfig } from '../../services/web3.service';
import { NgIf, AsyncPipe, NgClass, CommonModule } from '@angular/common';
import { ToastsComponent } from '../../toasts/toasts.component';
import { formatUnits, parseAbiItem, parseUnits } from 'viem';
import { getPublicClient, readContract, simulateContract, waitForTransactionReceipt, watchContractEvent, writeContract } from '@wagmi/core';
import { contractList } from '../../models/contract-list';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { calcInitialTokens } from '../../utils/calculateTokens';
import { newsCountries } from '../../models/news-countries';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Blockchain } from '../../models/blockchain';
import { galadriel_devnet } from '../../services/extra-chains';

const PopCoinFactoryABI = require( "../../../assets/abis/pop-coin-factory.json");
const PumpAIGrokMetadataFactoryABI = require( "../../../assets/abis/pump-ai-metadata-grok-factory.json");
const GrokLLMABI = require( "../../../assets/abis/grok-simple-llm.json");

const PumpAIGrokMetadataFactoryAddress ='0x84b4FDBB6186a555b9B35A1c4154276CC28858C2'
  const imageGenAddress = '0xA4cAd753210FCFca58dc71eeeA00475A4b7aDFDd'


@Component({
  selector: 'app-create-ai',
  standalone: true,
  imports: [NgxSpinnerModule, CommonModule, NgbTooltipModule, ToastsComponent, NgIf, AsyncPipe,FormsModule ,  ReactiveFormsModule, NgClass],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateWithAiComponent {
  ngxSpinner = inject(NgxSpinnerService);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  toastService = inject(AppToastService)

  formStep =0;

  memeCoinTopic: string ='';

  memeCoinPromptTemplate: string = `
Create a Memecoin(only 1) based on the topic '{topic}' and output the following attributes:
Coin Name, Symbol, description(max length should be 360 chracters), keywords (comma seperated, that will help in creating a good image for it)			
Output all results as json alone in form below, remove all extra information

"""
{
  coinName: '',
  symbol: '',
  description: '',
  keywords: ''
}
"""
	`;
  memeCoinPrompt: string ='';

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

  metadataResult: any;
  imageResult: any;
  imagestyles = [
    "Cartoonish",
  "Minimalist",
  "Pixel Art",
  "Surrealist",
  "Pop Art",
  "Graffiti",
  "Low Poly",
  "Watercolor",
  "Cyberpunk",
  "Memetic"

  ]

  selectedImageStyle?: string;
  imageUrlGenerated?: string;
  isGeneratingImage = false;
  isGeneratingLandingPage=false;
  landingPageHtml?: string;



  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2
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
        name: ['TKNA', [Validators.required, Validators.minLength(3)]],
        symbol: ['TKNA', [Validators.required, Validators.maxLength(9)]],
        description: ['Premium meme coin', [ Validators.maxLength(600)]],
        initialBuyInEth: ['1', [Validators.required, Validators.min(0), Validators.max(1000000)]],
        router: ['', [Validators.required]],
        
        coinLogo: ['https://picsum.photos/id/237/200/300', [Validators.required]],  // Valid URL for image  // , Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        coinBanner: ['https://picsum.photos/id/237/300/300', [Validators.required]], // Valid URL for image   //, Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i)
        twitter: ['', [ Validators.pattern(/^https:\/\/twitter\.com\/([a-zA-Z0-9_]{1,15})$/)]], // Valid Twitter URL
        telegram: ['', [ Validators.pattern(/^https?:\/\/(t\.me|telegram\.me|telegram\.org)\/[a-zA-Z0-9_]{1,50}$/)]], // Valid Telegram URL
        website: ['https://www.meme.com', [ Validators.pattern(/^(https?:\/\/[^\s/$.?#].[^\s]*)$/)]], // Valid URL
      });
    }

    
    
    
  }

  
  currentChainName?: string;

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


        
        


        // this.testGrok();
        // const response = '```json\n{\n  "coinName": "TrumpDollars",\n  "symbol": "TRUMP",\n  "description": "A Trump-themed memecoin to make America rich again."\n}\n```' 
        // let json = response.substring(response.indexOf('```json') + 7, response.length - 3 ) // remove ```json and ```
        //   let parsed = JSON.parse(json)
        //   console.log('parsed: ', parsed)
        
        


      }
    })

    
  }



  ngOnDestroy(){
    if(this.initialBuyTokenAmountSubscription){
      this.initialBuyTokenAmountSubscription.unsubscribe();
      this.initialBuyTokenAmountSubscription=undefined
    }
    
  }


  async testGrok(){

    
    let prompt =  this.memeCoinPromptTemplate.replace('{topic}', 'Davido').replace(/\n/g, '<br>')
    
    prompt = prompt.replace(/\t/g, '')
    console.log('prmotpt:: ',prompt)
    // return;
    try{
      let write= await simulateContract(wagmiConfig, {
        abi: GrokLLMABI as any,
        address: '0x4530f5E2dA67384eC4d86Fa78020602CDb40e7b5',
        functionName: 'sendMessage',
        args: [prompt]
      });

      let hash = await writeContract(wagmiConfig, write.request);

      let txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash
      })

      

      if(txReceipt.status=== 'success'){
        // const unwatch =  watchContractEvent(wagmiConfig, {  
        //   address: '0x4530f5E2dA67384eC4d86Fa78020602CDb40e7b5',
        //   abi: GrokLLMABI,
        //   eventName: 'ResponseReceived', // parseAbiItem('event LLMResponseReceived(uint indexed chatId, string response)'),
        //   args: {          
        //     // runId: BigInt(0)
        //   },
        //   chainId: galadriel_devnet.id,
        //   onError: (error)=>{
        //     console.error('Logs error', error) 
        //   },
        //   onLogs:(logs:any)=>{
        //     console.log('Logs changed!', logs) 
        //     const response = logs[0].args
        //     console.log('response: ',response)
        //     if(response){
    
        //     }
    
            
        //   }
        //   // blockHash: txReceipt.blockHash,
        //   // fromBlock: receipt.blockNumber,
        //   // toBlock: receipt.blockNumber + 1n
        // });

        // unwatch()

        const pc = getPublicClient(wagmiConfig)
        while(true){
          
          const logs: any = await pc?.getLogs({  
            address: '0x4530f5E2dA67384eC4d86Fa78020602CDb40e7b5',
            event: parseAbiItem('event ResponseReceived(uint runId, string message)'),
            args: {          
              
            },
            // blockHash: txReceipt.blockHash,
            fromBlock: txReceipt.blockNumber,
            // toBlock: receipt.blockNumber + 1n
          }).catch((err1)=>{
            console.error('Error gettin logs:', err1)
          });
          if(logs && logs.length>0){
          // const chatId = logs[0].args.chatId
            console.log('chatid:', logs[0].args)
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        // while (true) {
        //   const response = await readContract(wagmiConfig, {
        //     address: '0x4530f5E2dA67384eC4d86Fa78020602CDb40e7b5',
        //     abi: GrokLLMABI,
        //     functionName:'response',
        //     args:[]
        //   });
        //   if (response) {
        //     console.log("Response from contract:", response);
        //     break;
        //   }else{
        //     console.log('response ull, starting again ')
        //   }
        //   await new Promise(resolve => setTimeout(resolve, 2000))
        // }
      

        
        
      }else{
        this.toastService.error('TEST GROK Generation failed', 'There was an issue, please try again later')
      }


    }catch(err){
      console.error('GROK Error:: ', err)
      
    }
  }

  async testGrok2(){

    
    let prompt =  this.memeCoinPromptTemplate.replace('{topic}', 'Kamala').replace(/\n/g, '<br>')
    
    prompt = prompt.replace(/\t/g, '')
    console.log('prmotpt:: ',prompt)
    // return;
    try{
      let write= await simulateContract(wagmiConfig, {
        abi: PumpAIGrokMetadataFactoryABI as any,
        address: PumpAIGrokMetadataFactoryAddress,
        functionName: 'onOracleGroqLlmResponse1',
        args: [1, 'myResponse', '']
      });

      let hash = await writeContract(wagmiConfig, write.request);

      let txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash
      })

      

      if(txReceipt.status=== 'success'){


        while (true) {
          
          const response = await readContract(wagmiConfig, {
            address: PumpAIGrokMetadataFactoryAddress,
            abi: PumpAIGrokMetadataFactoryABI,
            functionName:'getDescription',
            args:[1]
          });
          if (response) {
            console.log("Response from contract:", response);
            break;
          }else{
            console.log('response ull, starting again ')
          }
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      

        
        
      }else{
        this.toastService.error('TEST GROK Generation failed', 'There was an issue, please try again later')
      }


    }catch(err){
      console.error('GROK Error:: ', err)
      
    }
  }

  onTopicChange(event: any) {
    // Get the new input value
    const newValue = (event.target as HTMLInputElement).value;
    // Perform actions based on the new value
    
    if(newValue && newValue.trim().length>0){
      this.memeCoinPrompt = this.memeCoinPromptTemplate.replace('{topic}', newValue)
    }else{
      this.memeCoinPrompt = ''
    }
    
  }

  async generateCoin(){


    this.ngxSpinner.show();

    let prompt = this.memeCoinPrompt.replace(/\n/g, '<br>')
    prompt = prompt.replace(/\t/g, '')
    console.log('prmotpt:: ',prompt)
    try{
      let write= await simulateContract(wagmiConfig, {
        abi: GrokLLMABI as any,
        address: PumpAIGrokMetadataFactoryAddress,
        functionName: 'sendMessage',
        args: [prompt]
      });

      let hash = await writeContract(wagmiConfig, write.request);

      let txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash
      })

      

      if(txReceipt.status=== 'success'){
        this.toastService.show('AI Generation started', 'Your Meme Coin details are being Generated')
        this.formStep=1;

        const pc = getPublicClient(wagmiConfig)
          
        
        const logs: any = await pc?.getLogs({  
          address: PumpAIGrokMetadataFactoryAddress,
          event: parseAbiItem('event MemeCoinDescriptionPromptInputted(address indexed owner, uint indexed chatId)'),
          args: {          
            
          },
          blockHash: txReceipt.blockHash,
          // fromBlock: receipt.blockNumber,
          // toBlock: receipt.blockNumber + 1n
        });

        const chatId = logs[0].args.chatId
        console.log('chatid:', chatId)
        this.waitForLLMTextResponse(chatId, txReceipt.blockNumber).then(()=>{});
        
      }else{
        this.toastService.error('AI Generation failed', 'There was an issue, please try again later')
      }

      this.ngxSpinner.hide();


    }catch(err){
      console.error('Error:: ', err)
      this.ngxSpinner.hide();
      this.toastService.error('AI Generation failed', 'There was an issue, please try again later')
    }
    
    
  }

  

  async waitForLLMTextResponse(chatId: any, blockNumber: any){
    //event LLMResponseReceived(uint indexed mintId, string response)
    const pc = getPublicClient(wagmiConfig)
    while(true){
      
      const logs: any = await pc?.getLogs({  
        address: PumpAIGrokMetadataFactoryAddress,
        event: parseAbiItem('event ResponseReceived(uint runId, string message)'),
        args: {          
          runId: chatId
        },
        // blockHash: txReceipt.blockHash,
        fromBlock: blockNumber,
        // toBlock: receipt.blockNumber + 1n
      }).catch((err1)=>{
        console.error('Error gettin logs:', err1)
      });
      if(logs && logs.length>0){
      
        console.log('Result:', logs[0].args)
        // const chatId = logs[0].args.chatId
        const response: string = logs[0].args.message.trim();
        if(response.indexOf('```json')>-1){
          let ix = response.indexOf('```json')
          let json = response.substring(ix + 7, response.indexOf('```',ix + 10)  ) // remove ```json and ```
          // console.log('json: ', json)
          let parsed = JSON.parse(json)
          // console.log('parsed: ', parsed)
          this.metadataResult = parsed;
        }
        else{
          console.error('Error Gen Metadata:', response)
          this.toastService.error('Error Generating Metadata','There as an error generating your Coin Details. <br> '+response)
        }

        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }



    
    // console.log('response getMessageHistory:: ', await readContract(wagmiConfig, {
    //   address: PumpAIGrokMetadataFactoryAddress,
    //   abi: PumpAIGrokMetadataFactoryABI,
    //   functionName:'getMessageHistory',
    //   args:[chatId]
    // }))

    // console.log('response:: ', await readContract(wagmiConfig, {
    //   address: PumpAIGrokMetadataFactoryAddress,
    //   abi: PumpAIGrokMetadataFactoryABI,
    //   functionName:'getDescription',
    //   args:[chatId]
    // }))
          
    

      
  }


  

  selectStyle(style: string) {
    this.selectedImageStyle = style;
  }


  async generateCoinImage(){


    this.ngxSpinner.show();

    let prompt =`make an image of: "${this.selectedImageStyle??'Memetic'} style image for a memecoin named ${this.metadataResult.coinName}. Consider the following keywords while creating it '${this.metadataResult.keywords}'"`.replace(/\n/g, '<br>')
    prompt = prompt.replace(/\t/g, '')
    console.log('prmotpt:: ',prompt)
    try{
      let write= await simulateContract(wagmiConfig, {
        abi: PumpAIGrokMetadataFactoryABI as any,
        address: imageGenAddress,
        functionName: 'promptForMemeCoinImage',
        args: [prompt]
      });

      let hash = await writeContract(wagmiConfig, write.request);

      let txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash
      })

      

      if(txReceipt.status=== 'success'){
        this.toastService.show('AI Image Generation started', 'Your Meme Coin image is being Generated')
        this.formStep=1;

        const pc = getPublicClient(wagmiConfig)
          
        
        const logs: any = await pc?.getLogs({  
          address: imageGenAddress,
          event: parseAbiItem('event MintInputCreated(address indexed owner, uint indexed chatId)'),
          args: {          
            
          },
          blockHash: txReceipt.blockHash,
          // fromBlock: receipt.blockNumber,
          // toBlock: receipt.blockNumber + 1n
        });

        const chatId = logs[0].args.chatId
        console.log('Image chatid:', chatId)
        this.isGeneratingImage=true
        this.waitForLLMImageResponse(chatId, txReceipt.blockNumber).then(()=>{});
        
      }else{
        this.toastService.error('AI Image Generation failed', 'There was an issue, please try again later')
      }

      this.ngxSpinner.hide();


    }catch(err){
      console.error('Error:: ', err)
      this.ngxSpinner.hide();
      this.toastService.error('AI Image Generation failed', 'There was an issue, please try again later')
    }
    
    
  }

  

  async waitForLLMImageResponse(chatId: any, blockNumber: any){
    //event LLMResponseReceived(uint indexed mintId, string response)
    const pc = getPublicClient(wagmiConfig)
    while(true){
      
      const logs: any = await pc?.getLogs({  
        address: imageGenAddress,
        event: parseAbiItem('event MemeImageRendered(uint indexed mintId, string url)'),
        args: {          
          mintId: chatId
        },
        // blockHash: txReceipt.blockHash,
        fromBlock: blockNumber,
        // toBlock: receipt.blockNumber + 1n
      }).catch((err1)=>{
        this.isGeneratingImage=false
        console.error('Error gettin logs:', err1)
      });
      if(logs && logs.length>0){
      
        console.log('Image Result:', logs[0].args)
        // const chatId = logs[0].args.chatId
        const response: string = logs[0].args.url;

        if(response.trim().startsWith('http')){
          
          this.imageUrlGenerated = response;
          this.isGeneratingImage=false
          this.formStep=2;

          this.createTokenForm.patchValue({
            name: this.metadataResult.coinName,
            symbol: this.metadataResult.coinName,
            description: this.metadataResult.description,
            coinLogo: this.imageUrlGenerated,
            coinBanner: this.imageUrlGenerated,
          });

          
          


        }else{
          this.isGeneratingImage=false
          console.error('Error Gen Image:', response)
          this.toastService.error('Error Generating Image','There as an error generating your image')
        }

        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
     
  }

  async generateLandingPage(){


    this.ngxSpinner.show();
    this.landingPageHtml =''
    let prompt = `Generate a landing page for the Meme coin '${this.metadataResult.coinName}' with symbol '${this.metadataResult.symbol}', use bootstrap 5 styling, output should be html text and should include tokenomics. Description for the meme coin is """${this.metadataResult.description}""". Output only the html and don't include any notes or message `.replace(/\n/g, '<br>')
    prompt = prompt.replace(/\t/g, '')
    console.log('Landing page prompt:: ',prompt)
    try{
      let write= await simulateContract(wagmiConfig, {
        abi: GrokLLMABI as any,
        address: PumpAIGrokMetadataFactoryAddress,
        functionName: 'sendMessage',
        args: [prompt]
      });

      let hash = await writeContract(wagmiConfig, write.request);

      let txReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash
      })      

      if(txReceipt.status=== 'success'){
        this.toastService.show('Landing Page Generation started', 'Your Meme Coin Landing page is being prepared')
        this.isGeneratingLandingPage=true;

        const pc = getPublicClient(wagmiConfig)
          
        
        const logs: any = await pc?.getLogs({  
          address: PumpAIGrokMetadataFactoryAddress,
          event: parseAbiItem('event MemeCoinDescriptionPromptInputted(address indexed owner, uint indexed chatId)'),
          args: {          
            
          },
          blockHash: txReceipt.blockHash,
          // fromBlock: receipt.blockNumber,
          // toBlock: receipt.blockNumber + 1n
        });

        const chatId = logs[0].args.chatId
        console.log('chatid:', chatId)
        this.waitForLLMLandingPageResponse(chatId, txReceipt.blockNumber).then(()=>{});
        
      }else{
        this.isGeneratingLandingPage=false;
        this.toastService.error('AI Generation failed', 'There was an issue, please try again later')
      }

      this.ngxSpinner.hide();


    }catch(err){
      this.isGeneratingLandingPage=false;
      console.error('Error:: ', err)
      this.ngxSpinner.hide();
      this.toastService.error('AI Generation failed', 'There was an issue, please try again later')
    }
    
    
  }


  async waitForLLMLandingPageResponse(chatId: any, blockNumber: any){
    //event LLMResponseReceived(uint indexed mintId, string response)
    const pc = getPublicClient(wagmiConfig)
    while(true){
      
      const logs: any = await pc?.getLogs({  
        address: PumpAIGrokMetadataFactoryAddress,
        event: parseAbiItem('event ResponseReceived(uint runId, string message)'),
        args: {          
          runId: chatId
        },
        // blockHash: txReceipt.blockHash,
        fromBlock: blockNumber,
        // toBlock: receipt.blockNumber + 1n
      }).catch((err1)=>{
        this.isGeneratingLandingPage=false;
        console.error('Error gettin logs:', err1)
      });
      if(logs && logs.length>0){
      
        console.log('Html Result:', logs[0].args)
        // const chatId = logs[0].args.chatId
        const response: string = logs[0].args.message.trim();
        if(response.indexOf('<html')>-1){
          this.landingPageHtml = response.substring(response.indexOf('<html'))          
          this.isGeneratingLandingPage=false;
          this.formStep=3;
          // setTimeout(()=>{
          //   this.renderer.selectRootElement(document.getElementById('mainform')).scrollIntoView({ behavior: 'smooth' });
          // },2000)
        }
        else{
          this.isGeneratingLandingPage=false;
          console.error('Error Generating Landing Page:', response)
          this.toastService.error('Error Generating Landing Page','There as an error generating your Coin Landing Page. <br> '+response)
        }

        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }



    
    // console.log('response getMessageHistory:: ', await readContract(wagmiConfig, {
    //   address: PumpAIGrokMetadataFactoryAddress,
    //   abi: PumpAIGrokMetadataFactoryABI,
    //   functionName:'getMessageHistory',
    //   args:[chatId]
    // }))

    // console.log('response:: ', await readContract(wagmiConfig, {
    //   address: PumpAIGrokMetadataFactoryAddress,
    //   abi: PumpAIGrokMetadataFactoryABI,
    //   functionName:'getDescription',
    //   args:[chatId]
    // }))
          
    

      
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
      })
      // if(simulateContractResult.request)
      const hash = await writeContract(wagmiConfig, simulateContractResult.request)

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

    } catch (error) {
      console.error('Token creation failed:', error);
      this.ngxSpinner.hide();
      this.toastService.error("Error Creating Token", "Token Creation Transaction Failed")
      // this.errorMessage = error.message || 'Transaction failed';
    }

    
  }

}
