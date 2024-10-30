import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, inject, PLATFORM_ID, signal, TemplateRef, ViewChild } from '@angular/core';
import { Web3ModalCoreButtonWrapperModule } from '../../web3modal-module/web3modal.module';
import { ActivatedRoute, Params, Router, RouterOutlet } from '@angular/router';
import { connect, getAccount, injected, readContract, reconnect, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { erc20Abi, formatUnits, parseUnits } from 'viem';
import { ApiService } from '../../services/api.service';
import { wagmiConfig, Web3Service } from '../../services/web3.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsComponent } from '../../toasts/toasts.component';
import { AppToastService } from '../../services/app-toast.service';
import { CoinItemComponent } from '../coin-item/coin-item.component';
import { Apollo, gql } from 'apollo-angular';
import {GET_ALL_TOKENS} from '../../models/graphql-queries';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ToastsComponent, RouterOutlet, Web3ModalCoreButtonWrapperModule, NgxSpinnerModule, CoinItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [NgbActiveModal ]
})
@AutoUnsubscribe
export class HomeComponent {
  @ViewChild('tokenApprovalModal', {static: false}) tokenApprovalModal!: TemplateRef<any>;

  coins?: any[];
  page=1;
  pageSize=24;
  filterChain?: number;

  private modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  ngxSpinner = inject(NgxSpinnerService);

  expireWatchInterval: any;
  isBrowser = signal(false);  // a signal to store if platform is browser

  

  constructor(public api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public w3s: Web3Service,
    public toastService: AppToastService,
    private readonly apollo: Apollo,
    @Inject(PLATFORM_ID) platformId: object){
    
    this.isBrowser.set(isPlatformBrowser(platformId));  // save isPlatformBrowser in signal
      // console.log("payAbi: ",PayProcessorAbi)
  }

  web3State: {open?: boolean,selectedNetworkId?: number}|undefined


  // loading = true;
  // error: any;
  // private querySubscription?: Subscription;

  async ngOnInit(){
    
    // this.querySubscription=this.apollo
    //   .watchQuery({
    //     query: GET_ALL_TOKENS,
    //   })
    //   .valueChanges.subscribe((result: any) => {
    //     console.log('data tok:', result.data)
    //     this.coins = result.data?.tokens.items;
    //     this.loading = result.loading;
    //     this.error = result.error;
    //   });


    this.route.params.subscribe((params: Params) => {
      
      this.api.getCoins(this.filterChain, this.page,this.pageSize).subscribe({
        next: (result:any) =>{
        //   {
        //     pageNumber: number;
        //     pageSize: number;
        //     totalNumberOfPages: number;
        //     totalNumberOfRecords: number;
        //     results: never[];
        // }
          // console.log('coins:', result)
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
    if(this.expireWatchInterval){
      clearInterval(this.expireWatchInterval);
    }
    
  }

  async ngAfterViewInit() {
    // child is set
    //console.log('After view init: ')
    
  }

 

  

}
