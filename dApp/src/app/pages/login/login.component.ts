import { AsyncPipe, NgClass, NgIf, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { reconnect, getAccount, disconnect } from '@wagmi/core';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Subscription, lastValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Web3Service, wagmiConfig } from '../../services/web3.service';
import { ToastsComponent } from '../../toasts/toasts.component';
import { Web3ModalCoreButtonWrapperModule } from '../../web3modal-module/web3modal.module';
import { AppToastService } from '../../services/app-toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgxSpinnerModule, ToastsComponent, Web3ModalCoreButtonWrapperModule, NgIf, AsyncPipe, NgbModalModule, ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  ngxSpinner = inject(NgxSpinnerService);
  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  toastService = inject(AppToastService)

  signupForm: FormGroup;

  invalidProfilePicture=true;
  currentProfilePicture?: File;

  displayNameNotUnique = false;
  displayNameSubscription?: Subscription;

  accountExists = false;

  nonce?: number;

  account?: string

  

  constructor(private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
    private fb: FormBuilder,
    private authService: AuthService
  ){
    
    this.signupForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]]
    });

    this.displayNameSubscription =  this.signupForm.get('displayName')!.valueChanges.subscribe(async (val:string) => {
      if(val.length>=5) {
        this.apiService.checkIfDisplayNameIsUnique(val).subscribe((unique:any) =>{
          this.displayNameNotUnique = !unique
        })
      } 
            
    })
    
    
  }

  async ngOnInit(){
    
    this.web3Service.account$.subscribe(async (account)=>{
      this.account=account
      if(account){
        
        let token=this.authService.token
        if(!token || account!=this.authService.account){

          //Check if User has account on API
          this.accountExists = (await lastValueFrom( this.apiService.checkIfAccountExists(account)).catch(()=>{})) as any
          // this.nonce = (await lastValueFrom( this.apiService.getAccountNonce(account)).catch(()=>{})) as any
        }else {
          //Back to home page
          this.router.navigate(['/'])
        }
        
      }
    })


  }

  ngOnDestroy(){
    if(this.displayNameSubscription){
      this.displayNameSubscription.unsubscribe();
      this.displayNameSubscription=undefined
    }
  }

  async connect() {
    
    try{
      let account = getAccount(wagmiConfig)
      if (account ) {
      
        if(!account.isConnected){
          
          await this.web3Service.w3modal?.open()
          
        }

        
      }else{
        const r = await reconnect(wagmiConfig)
        
       
      }
      
    }catch(err){
      console.error('Error Connecting: ', err)
      this.toastService.error("Error Connecting Wallet", "Please try again later")
    }
  }

  async disconnect(){
    disconnect(wagmiConfig)
  }

  async signToLogin(){
    this.ngxSpinner.show();
    const account = this.web3Service.account!
    this.nonce = (await lastValueFrom( this.apiService.getAccountNonce(account)).catch(()=>{})) as any
    const signature = await this.web3Service.signLoginMessage(this.nonce)

    this.apiService.login(account!, signature).subscribe(async (result:any)=>{              
      this.authService.set( result.token, account!)
      this.ngxSpinner.hide();
      this.toastService.show("Success", "Login Complete")

      this.router.navigate(['/'])
      // localStorage.setItem(ACCESS_TOKEN_KEY, result.token)

      // const result2 = await lastValueFrom(this.apiService.get('auth/test-auth', result.token.token))
      // console.log('Result tkn test: ', result2)
    })
  }

  
  selectProfilePicture(event: any): void {
    this.currentProfilePicture = event.target.files.item(0);
    const extension = this.currentProfilePicture?.name.split(".").pop();
    this.invalidProfilePicture= !(extension =='png' || extension =='jpg' || extension =='jpeg')
    // console.log(event.target.files.item(0));
    // console.log(extension);
  }

  async submitSignup(){
    this.ngxSpinner.show()
    //Sign
    const account = this.web3Service.account!
    this.nonce = (await lastValueFrom( this.apiService.getAccountNonce(account)).catch(()=>{})) as any
    const signature = await this.web3Service.signLoginMessage(this.nonce)

    let result:any = await lastValueFrom(this.apiService.signUp(this.web3Service.account!,this.signupForm.get('displayName')?.value, signature, this.currentProfilePicture)).catch(()=>{
      this.ngxSpinner.hide()
      this.toastService.error("Error Signing up", "Please try again later")
    })
    if(result){
      this.authService.set( result.token, this.web3Service.account!)
      this.ngxSpinner.hide()
      this.toastService.show("Success", "Signup Complete")

      this.router.navigate(['/'])
    }
    
  }
}
