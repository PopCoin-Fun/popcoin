import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ApiService } from './api.service';
import { isPlatformBrowser } from '@angular/common';


export const ACCESS_TOKEN_KEY ="ACCESS_TOKEN_KEY"

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState = new BehaviorSubject<boolean>(false)
  token?: string;
  account?: string;

  private router = inject(Router)
  private apiService = inject(ApiService)
  storage?: Storage;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,) {
    if (isPlatformBrowser(this.platformId)){
      this.storage=sessionStorage;
    }
    const savedTokenString = this.storage?.getItem(ACCESS_TOKEN_KEY);
    if(savedTokenString && savedTokenString.length>10){
      const savedToken : {
        expires: Date,
        token:string,
        account: string
      } = JSON.parse(savedTokenString ) as any
      
      if(new Date().getTime() < new Date(savedToken.expires) .getTime()){
        this.token = savedToken.token
        this.account = savedToken.account
        this.authState.next(!!this.token)
      }
    }
    
  }

  /************************************************
   * SET FUNCTION
   *************************************************/
  /**
    * Save token to local-storage and update  Auth State.
    * @param token
    */
  set(token: any, account: string) {
    
    this.storage?.setItem(ACCESS_TOKEN_KEY, JSON.stringify({
      ...token,
      account
    }));
    this.authState.next(true);
    this.token = token.token;
    this.account=account
  }


  /**
   * Clear local-storage and sign out.
   */
  signOut(): void {
    this.storage?.removeItem(ACCESS_TOKEN_KEY);
    this.token = undefined;
    this.account = undefined;
    this.authState.next(false);
    
    this.router.navigateByUrl('/login');
  }




  /************************************************
 * HASLOGGEDIN  FUNCTION
 *************************************************/
  /**
   * Simple check if user's is already authenticated.
   */
  hasLoggedIn(): any {
    return this.authState.getValue();
  }




}
