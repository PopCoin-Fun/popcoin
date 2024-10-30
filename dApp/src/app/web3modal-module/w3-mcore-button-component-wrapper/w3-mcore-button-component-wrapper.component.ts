import { Component, Input, inject } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-w3m-core-button-wrapper',
  templateUrl: './w3-mcore-button-component-wrapper.component.html',
  styleUrls: ['./w3-mcore-button-component-wrapper.component.scss']
})
export class W3MCoreButtonComponentWrapperComponent {
  @Input() showBalance: 'show'|'hide' = 'show';
  labelText= "Connect Wallet"
  web3Service = inject(Web3Service);
  constructor(){
    this.web3Service.account$.subscribe((account)=>{
      if(account){
        this.labelText='Disconnect'
      }
      //console.log('Account now conneted?: ', account)
    })
  }
}
