import { DecimalPipe, NgIf } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { getBalance, readContract } from '@wagmi/core';
import { chains, wagmiConfig } from '../../services/web3.service';
import { formatUnits } from 'viem';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
const PopCoinFactoryABI = require( "../../../assets/abis/pop-coin-factory.json");
const FunTokenABI = require( "../../../assets/abis/fun-token.json");

@Component({
  selector: 'app-coin-item',
  standalone: true,
  imports: [NgIf, DecimalPipe, RouterLink],
  templateUrl: './coin-item.component.html',
  styleUrl: './coin-item.component.scss'
})
export class CoinItemComponent {
  @HostBinding('className') componentClass: string="col-md-3 col-sm-4 ";
  @Input() coin: any;

  marketCap: any;
  marketCapSymbol: any;

  async ngOnInit(){
    if(this.coin && this.coin.address){
      
      this.marketCapSymbol= chains[this.coin.chainId].nativeCurrency.symbol; // ethBalance.symbol
      
    }
  }


}
