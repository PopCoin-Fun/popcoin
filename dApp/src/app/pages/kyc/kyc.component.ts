import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { BVNish, BVNs, KycService } from '../../services/kyc.service';
import { NgIf } from '@angular/common';
import { Web3Service } from '../../services/web3.service';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { AppToastService } from '../../services/app-toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [ ReactiveFormsModule, NgIf],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class KycComponent {
  kycForm: FormGroup;
  kycCompleted?: boolean ;

  

  constructor(private fb: FormBuilder,
    private kycService: KycService,
    public w3s: Web3Service,
    private ngxSpinner: NgxSpinnerService,
    private toastService: AppToastService,
    private router: Router
  ) {
    this.kycForm = this.fb.group({
      bvn: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      surname: ['', Validators.required],
      firstName: ['', Validators.required],
      dob: ['', [Validators.required, Validators.pattern(/^\d{4}\/\d{2}\/\d{2}$/)]],
    });
  }

  ngOnInit(){
    
  }

  // Method to check KYC completion
  async checkKYC() {

    // console.log('Result: ', await this.kycService.attest('0x24', this.w3s.account!, BVNs[0]))
    
    this.ngxSpinner.show();
    try{
      const enteredData = this.kycForm.value;
      // const matchingBVN = BVNs.some(bvnData =>
      //   bvnData.bvn === enteredData.bvn &&
      //   bvnData.surname.toLowerCase() === enteredData.surname.toLowerCase() &&
      //   bvnData.firstName.toLowerCase() === enteredData.firstName.toLowerCase() &&
      //   bvnData.dob === enteredData.dob
      // );
      this.kycCompleted = this.kycService.verify(enteredData.bvn, enteredData.surname, enteredData.firstName, enteredData.dob);
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      this.ngxSpinner.hide()
      if(this.kycCompleted){
        this.toastService.show('Verified','Your BVN Details was Verified successfully. Now attest your KYC onchain', 5000);
      }else{
        this.toastService.error('Verification failed', "We couldn't Verifying the information your provided");
      }
    }catch(err){
      this.kycCompleted =false;
      this.toastService.error('Verification Error','Error Verifying your Details');
      this.ngxSpinner.hide();
      console.error(err);
    }
  }


  async attest(){
    
    this.ngxSpinner.show();
    try{

      let result = await this.kycService.attest(this.w3s.account!, this.kycForm.value)
      this.toastService.show('KYC Completed','You can now Create Meme Coins on PopCoin', 5000);
      this.ngxSpinner.hide();
      this.router.navigate(['/ai-create'])

    }catch(err){
      this.toastService.error('Attestation Error','Error Attesting your KYC onChain');
      this.ngxSpinner.hide();
      console.error(err);
    }
  }
}

