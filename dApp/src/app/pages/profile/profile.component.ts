import { Component, Inject, PLATFORM_ID, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, lastValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AppToastService } from '../../services/app-toast.service';
import { AuthService } from '../../services/auth.service';
import { Web3Service } from '../../services/web3.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  ngxSpinner = inject(NgxSpinnerService);
  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  
  web3Service = inject(Web3Service);
  apiService = inject(ApiService);
  toastService = inject(AppToastService)

  profileForm?: FormGroup;

  invalidProfilePicture=true;
  currentProfilePicture?: File;

  userProfile: any;


  account?: string
  loading = true;
  

  constructor(private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object, 
    private fb: FormBuilder,
    private authService: AuthService
  ){
            
    
  }

  async ngOnInit(){
    this.loading=true;


    this.web3Service.account$.subscribe(async (account)=>{
      this.loading=true;
      this.account=account
      if(account){
        
        let token=this.authService.token
        if(!token || account!=this.authService.account){
          this.loading=false;
          this.router.navigate(['/login'])
        }else {
          
          
          this.apiService.getProfile().subscribe({
            next: (profile: any) => {
              this.userProfile = profile;
              this.profileForm = new FormGroup({
                displayName: new FormControl({ value: profile.displayName, disabled: true }),
                email: new FormControl(profile.email.endsWith('@popcoin.com')?'':profile.email, [Validators.required, Validators.email, Validators.maxLength(75)]),
                profileImage: new FormControl(null)
              });
  
              this.loading=false
            },
            complete: ()=>{
              this.loading=false
            },
            error: (eerr)=>{
              this.loading=false
            }

          });
      
        }
        
      }else{
        // this.loading=false;
      }
    })


  }

  async selectProfilePicture(event: any) {
    this.currentProfilePicture = event.target.files.item(0);
    const extension = this.currentProfilePicture?.name.split(".").pop();
    this.invalidProfilePicture= !(extension =='png' || extension =='jpg' || extension =='jpeg')

    if(this.invalidProfilePicture===false){
      let result:any = await lastValueFrom(this.apiService.updateProfilePicture( this.currentProfilePicture!)).catch(()=>{
        this.ngxSpinner.hide()
        this.toastService.error("Error Uploading Profile Picture", "Please try again later")
      })
      if(result){
        // console.log(result)
        this.ngxSpinner.hide()
        this.toastService.show("Success", "Profile Picture Upload Complete")
        this.userProfile.profileImage=result.profileImage
      }
    }

    
  }


  async updateProfile(){
    this.ngxSpinner.show()
    

    let result:any = await lastValueFrom(this.apiService.updateProfile(this.profileForm?.get('email')?.value)).catch(()=>{
      this.ngxSpinner.hide()
      this.toastService.error("Error Updating Profile", "Please try again later")
    })
    if(result){
      this.userProfile.email=result.email
      this.ngxSpinner.hide()
      this.toastService.show("Success", "Update Complete")
    }
    
  }
  
}
