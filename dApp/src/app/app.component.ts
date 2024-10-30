import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, inject, PLATFORM_ID, signal, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastsComponent } from './toasts/toasts.component';
import { Web3ModalCoreButtonWrapperModule } from './web3modal-module/web3modal.module';
import { disconnect, getAccount, readContract, reconnect } from '@wagmi/core';
import { chains, wagmiConfig, Web3Service } from './services/web3.service';
import { AsyncPipe, DecimalPipe, isPlatformBrowser, NgClass, NgIf } from '@angular/common';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgbActiveModal, NgbCollapseModule, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ACCESS_TOKEN_KEY, AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Blockchain } from './models/blockchain';
import { KycService } from './services/kyc.service';
import { formatUnits } from 'viem';
import { SUPRA_ORACLE_ABI } from './abis/supra';

const TOKEN_KEY="TOKEN_KEY"



@Component({
  selector: 'app-root',
  standalone: true,
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, RouterLink,DecimalPipe, NgxSpinnerModule, ToastsComponent,NgbCollapseModule, Web3ModalCoreButtonWrapperModule, NgIf, AsyncPipe, NgbModalModule, ReactiveFormsModule, NgClass],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgbActiveModal ]
  
})
export class AppComponent {
  @ViewChild('signInModal', {static: false}) signInModal!: TemplateRef<any>;
  @ViewChild('howItWorksModal', {static: false}) howItWorksModal!: TemplateRef<any>;

  title = 'Pop Coin';

  ngxSpinner = inject(NgxSpinnerService);
  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);

  signupForm: FormGroup;

  invalidProfilePicture=true;
  currentProfilePicture?: File;

  displayNameNotUnique = false;
  displayNameSubscription?: Subscription;

  chainNativeCurrencySymbol = 'frxETH';

  blockchain?: Blockchain;
  marketCapTargetUSD= signal(0)

  nonce?: number

  isMenuCollapsed=true

  constructor(private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
    private fb: FormBuilder,
    private authService: AuthService,
    private kycService: KycService
  ){
    if (isPlatformBrowser(this.platformId)) {
      
      if(!!localStorage.getItem('@w3m/connected_connector')){
        
        reconnect(wagmiConfig).then((cn)=>{
          
        }).catch((err)=>{
          console.error('Error reconnecting', err)
        })
      }
    }

    this.signupForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]]
    });

    this.displayNameSubscription =  this.signupForm.get('displayName')!.valueChanges.subscribe(async (val:string) => {
      if(val.length>=5) {
        this.apiService.checkIfDisplayNameIsUnique(val).subscribe((unique:any) =>{
          this.displayNameNotUnique = !!!unique
        })
      } 
            
    })
    
    
  }

  async ngOnInit(){
    // const sid = 1;
    // const txref = '0x9fea8411d3716a7f9a8e99c3e0ce2e491e2120284d1fa7afbe4fa22341248984';
    // console.log(`Navigating to /${txref}/${sid}`);
    // this.router.navigate([`/${txref}/${sid}`]).catch(error => {
    //   console.error('Navigation error:', error);
    // });
    
    
    this.web3Service.chainId$.subscribe(async (chainId)=>{
      if(chainId){
        // const gasPrice: any = await readContract(wagmiConfig, {
        //   abi: SUPRA_ORACLE_ABI as any,
        //   functionName: 'getPrice',
        //   address: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        //   args: [260],
        //   chainId: 12227332
        // })

        // console.log('GAS:', gasPrice, gasPrice.decimals.toString())

        // console.log('GAS Price:', formatUnits(gasPrice.price,gasPrice.decimals.toString()) )

        /*decimals: 18n
​       price: 3844500000000000000n
        round: 1727849709000n
​         time:*/

        this.blockchain = await this.apiService.getBlockChain(chainId)
        this.chainNativeCurrencySymbol = chains[chainId].nativeCurrency.symbol;
        
        // if(b){
        //   this.marketCapTargetUSD.set( await this.apiService.convertETHtoUSD(b.targetMarketCap));
        // }

        
        
      }
    })

    this.web3Service.account$.subscribe(async (account)=>{
      if(account){



        let token=this.authService.token

        // console.log('token ', token)
        // console.log('account ', account) 
        // console.log('this.authService.account ', this.authService.account, '\n ======')
        if(!token || this.authService.account !=account){
          // console.log('redirecting to login')
          this.router.navigate(['login'])
          // this.nonce = (await lastValueFrom( this.apiService.getAccountNonce(account)).catch(()=>{})) as any
          // //Check if User has account on API
          // const exists: any =await lastValueFrom( this.apiService.checkIfAccountExists(account)).catch(()=>{})
          
          
          // if(!exists){
          //   //Create account by showing dialog for creating 
          //   const modalRef = this.modalService.open(this.signInModal, { 
          //     ariaLabelledBy: 'modal-basic-title' ,
          //     backdrop: 'static',
          //     keyboard: false
          //   }).result

          //   const mResult = await modalRef.catch(        
          //     (reason) => {
          //       // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        
          //       //console.log('Approval not given: ', reason)
          //     },
          //   );

          //   //Sign
          //   const timestamp = Date.now()
          //   const signature = await this.web3Service.signLoginMessage(this.nonce)

          //   let result:any = await lastValueFrom(this.apiService.signUp(account,this.signupForm.get('displayName')?.value, signature,timestamp, this.currentProfilePicture))
          //   this.authService.set( result.token, account)

          // }else{
            
          //   const signature = await this.web3Service.signLoginMessage(this.nonce)

          //   this.apiService.login(account, signature).subscribe(async (result:any)=>{              
          //     this.authService.set( result.token, account)
          //     // localStorage.setItem(ACCESS_TOKEN_KEY, result.token)

          //     // const result2 = await lastValueFrom(this.apiService.get('auth/test-auth', result.token.token))
          //     // console.log('Result tkn test: ', result2)
          //   })
          // }
        }


        // this.kycService.registerSchema().then((schema)=>{
        //   console.log('Schema: ', schema) 
        // }).catch((err)=>{
        //   console.error('err schema:', err)
        // })
        
        // if(isPlatformBrowser(this.platformId)){
        //   setTimeout(async ()=>{
        //     this.chainNativeCurrencySymbol = chains[this.web3Service.chainId!].nativeCurrency.symbol;
        //     if(environment.useFrx===true){
        //       this.chainNativeCurrencySymbol= "frxETH"
        //     }
            
        //   }, 1300)
        // }

        
        
        
      }
    })
    // console.log('this.router.url',this.router.url)
    // if(this.router.url=="/"){
    //   if (isPlatformBrowser(this.platformId)) {
    //     setTimeout(()=>{
    //       if(this.web3Service.chainId){
    //         this.openHowItWorks();
    //       }
    //     }, 3500)
        
    //   }
      
    // }
  }

  ngOnDestroy(){
    if(this.displayNameSubscription){
      this.displayNameSubscription.unsubscribe();
      this.displayNameSubscription=undefined
    }
  }

  async connect() {
    if (!getAccount(wagmiConfig).isConnected) {
      
      this.web3Service.w3modal?.open({view: 'Connect'})
    }
  }

  async disconnect(){
    await disconnect(wagmiConfig)
    //clear token
    this.authService.signOut();
  }

  
  selectProfilePicture(event: any): void {
    this.currentProfilePicture = event.target.files.item(0);
    const extension = this.currentProfilePicture?.name.split(".").pop();
    this.invalidProfilePicture= !(extension =='png' || extension =='jpg' || extension =='jpeg')
    console.log(event.target.files.item(0));
    console.log(extension);
  }

  async openHowItWorks(){
    const modalRef = this.modalService.open(this.howItWorksModal, { 
      ariaLabelledBy: 'modal-basic-title' ,
      backdrop: 'static',
      keyboard: false
    }).result

    const mResult = await modalRef.catch(        
      (reason) => {
        // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;

        //console.log('Approval not given: ', reason)
      },
    );
  }
}
