import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { inject } from "@angular/core";

import { AuthService } from '../services/auth.service';
import { Observable } from "rxjs";

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {

    // If User has logged in
  return inject(AuthService).hasLoggedIn()
    ? true
    // User not logged in
    : inject(Router).createUrlTree(['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    })
};
