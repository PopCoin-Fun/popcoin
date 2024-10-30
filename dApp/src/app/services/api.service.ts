import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom, shareReplay } from 'rxjs';
import { Observable, of } from 'rxjs';
import { map, tap,  } from 'rxjs/operators';
import { Blockchain } from '../models/blockchain';
import { formatEther, formatUnits } from 'viem';
import { readContract } from '@wagmi/core';
import { wagmiConfig } from './web3.service';
import { SUPRA_ORACLE_ABI } from '../abis/supra';


const BaseAPIUrl = environment.BaseAPiUrl



interface ApiResponse {
  pageNumber: number;
  pageSize: number;
  totalNumberOfPages: number;
  totalNumberOfRecords: number;
  results: Blockchain[];
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private currencyRateCache$? : Observable<any>;
  private blockchainCache$? : Observable<Blockchain[]>
  ;

  constructor(private http: HttpClient) {

    
   }

  checkIfAccountExists(walletAddress: string){
    return this.http.post(`${BaseAPIUrl}/auth/accountexists/${walletAddress}`, {})
  } 

  getAccountNonce(walletAddress: string){
    return this.http.post(`${BaseAPIUrl}/auth/nonce/${walletAddress}`, {})
  } 

  getProfile(){
    return this.http.get(`${BaseAPIUrl}/auth/profile`)
  } 

  checkIfDisplayNameIsUnique(name: string){
    return this.http.get(`${BaseAPIUrl}/auth/is-unique-display-name/${name}`)
  } 

  signUp(walletAddress: string, displayName: string, signature: string, file?: File ){
    const formData: FormData = new FormData();
    if(file){
      formData.append('file', file);
    }
    formData.append('address', walletAddress);
    formData.append('displayName', displayName);
    
    // formData.append('timeStamp', timestamp.toString());
    formData.append('signature', signature);

    
    return this.http.post(`${BaseAPIUrl}/auth/signup-with-wallet`, formData);
  
  }

  login(walletAddress: string,  signature: string ){
    const formData: FormData = new FormData();
    
    formData.append('address', walletAddress);
    
    // formData.append('timeStamp', timestamp.toString());
    formData.append('signature', signature);

    return this.http.post(`${BaseAPIUrl}/auth/login-with-wallet`,formData)

    // const req = new HttpRequest('POST', `${BaseAPIUrl}/auth/login-with-wallet`, formData, {
    //   responseType: 'json',
    // });
    // return this.http.request(req);
  
  }

  updateProfile( email: string ){
      
    return this.http.post(`${BaseAPIUrl}/auth/profile`, {
      email
    });
  
  }

  updateProfilePicture( file: File ){
    const formData: FormData = new FormData();
    formData.append('file', file);
    
        
    return this.http.post(`${BaseAPIUrl}/auth/update-profile-picture`, formData);
  
  }

  get(path: string, token: string){

    let headers = new HttpHeaders();
    headers = headers.append('Authorization',`Bearer ${token}`)
    console.log(headers)
    return this.http.get(`${BaseAPIUrl}/${path}`, {headers: headers})
  }

  getBlockChains(){
    if (!this.blockchainCache$) {
      
      this.blockchainCache$ = this.http.get(`${BaseAPIUrl}/blockchains`).pipe(
        tap((data: any) => {
          // console.log('Data fetched from API') 
        }),
        map((m:ApiResponse)=> m.results),
        shareReplay(1)
      );
    }
    return this.blockchainCache$;

  }

  async getBlockChain(chainId: number){
    const blockchains = await lastValueFrom(this.getBlockChains())
    return blockchains.find(f=>f.id==chainId)
  }

  getCoins(chainId: number|undefined=undefined, page:number=1, pageSize:number=24){
    const chainQuery = chainId? `&chainId=${chainId}`:'';

    const queryParams = `?page=${page}&pageSize=${pageSize}${chainQuery}`
    
    return this.http.get(`${BaseAPIUrl}/coins${queryParams}`)
  }

  getMyCoins(chainId: number|undefined=undefined, page:number=1, pageSize:number=24){
    const chainQuery = chainId? `&chainId=${chainId}`:'';

    const queryParams = `?page=${page}&pageSize=${pageSize}${chainQuery}`
    
    return this.http.get(`${BaseAPIUrl}/coins/get-mine/${queryParams}`)
  }

  getTrendingNews(countryCode: string, page:number=1, pageSize:number=24){
    
    const queryParams = `?page=${page}&pageSize=${pageSize}`
    
    return this.http.get(`${BaseAPIUrl}/news/get-trending/${countryCode}${queryParams}`)
  }

  getCoinComments(coinId: string){
    return this.http.get(`${BaseAPIUrl}/coins/comments/${coinId}`)
  }

  getCoinTrades(coinId: string){
    return this.http.get(`${BaseAPIUrl}/coins/trades/${coinId}`)
  }

  getCoinHolders(coinId: string){
    return this.http.get(`${BaseAPIUrl}/coins/holders/${coinId}`)
  }

  getCoin(coinId: string){
    return this.http.get(`${BaseAPIUrl}/coins/${coinId}`)
  }

  addComment(coinId: any, comment: string, tradeType?: 0|1, tradeAmountInEth?: number){
    return this.http.post(`${BaseAPIUrl}/coins/add-comment`, {
      comment,
      coinId: coinId,
      tradeType,
      amount: tradeAmountInEth
    })
  }

  notifyCoinCreateSuccess(chainId: number,blockNumber: any, coinInfo: any){
    return this.http.post(`${BaseAPIUrl}/coins`, {
      blockNumber: blockNumber.toString(),
      chainId: chainId,
      ...coinInfo

    })
  }

  async getCurrencyRateViaSupra(currencyIndex: number){
    const gasPrice: any = await readContract(wagmiConfig, {
      abi: SUPRA_ORACLE_ABI as any,
      functionName: 'getPrice',
      address: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
      args: [currencyIndex],
      chainId: 12227332
    })

    if(gasPrice && gasPrice.price && gasPrice.decimals){
      // console.log('GAS:', gasPrice, gasPrice.decimals.toString())
      // console.log('GAS Price:', formatUnits(gasPrice.price,gasPrice.decimals.toString()) )

      return +formatUnits(gasPrice.price,gasPrice.decimals.toString())
    }

    return undefined
  }

  getCurrencyRates() {
    if (!this.currencyRateCache$) {
      const url = `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=USDT,USD,ETH,BNB&api_key=${environment.cryptoCompareApiKey}`

      this.currencyRateCache$ = this.http.get(url).pipe(
        // tap(data => console.log('Data fetched from API')),
        shareReplay(1)
      );
    }
    return this.currencyRateCache$;
  }

  async convertETHtoUSD(amountInETH: number){
    const rates: any = await lastValueFrom( this.getCurrencyRates());
    // console.log('rates:', rates)
    return amountInETH / rates.ETH;
  }
  // async getPriceInNear(amountInNGN: number){
  //   const rates: any = await lastValueFrom( this.getCurrencyRates());
  //   return amountInNGN * rates.NEAR;
  // }



}
