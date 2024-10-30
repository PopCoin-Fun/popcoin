import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { AppToastService } from '../../services/app-toast.service';
import { Web3Service } from '../../services/web3.service';
import { CoinItemComponent } from '../coin-item/coin-item.component';

@Component({
  selector: 'app-my-coins',
  standalone: true,
  imports: [CommonModule, CoinItemComponent],
  templateUrl: './my-coins.component.html',
  styleUrl: './my-coins.component.scss'
})
export class MyCoinsComponent {
  
  coins?: any[];
  page=1;
  pageSize=24;
  filterChain?: number;
  
  isBrowser = signal(false);  // a signal to store if platform is browser

  

  constructor(public api: ApiService,
    private route: ActivatedRoute,
    public w3s: Web3Service,
    @Inject(PLATFORM_ID) platformId: object){
    
    this.isBrowser.set(isPlatformBrowser(platformId));  // save isPlatformBrowser in signal
      // console.log("payAbi: ",PayProcessorAbi)
  }

  web3State: {open?: boolean,selectedNetworkId?: number}|undefined

  async ngOnInit(){
    

    this.route.params.subscribe((params: Params) => {
      
      
      
      this.api.getMyCoins(this.filterChain, this.page,this.pageSize).subscribe({
        next: (result:any) =>{
        //   {
        //     pageNumber: number;
        //     pageSize: number;
        //     totalNumberOfPages: number;
        //     totalNumberOfRecords: number;
        //     results: never[];
        // }
          this.coins=result.results;
        
        },
        error: (err: any)=>{
          console.error('Error loading coins: ', err)
          // this.toastService.error('Error','Error loading coins', 60000)
        },
        complete: ()=>{
          
        }
      
      })
      

      
    })


    
  }

  showW3Modal(){
    this.w3s.w3modal?.open()
  }

  ngOnDestroy() {
    
  }
}
