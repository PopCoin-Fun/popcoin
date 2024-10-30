import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpInterceptorFn } from '@angular/common/http';



export const AuthInterceptorService: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService)

  // console.log('request.url: ', request.url)
  if(request.url.startsWith('https://localhost:') || request.url.startsWith('https://popcoin') ||  request.url.startsWith('https://api.popcoin')){
    request = request.clone({
      setHeaders: {
        'authorization': `Bearer ${authService.token || ''}`,
        // 'client-time': new Date().toISOString()
      }
    });
  }
  


  return next(request)
    .pipe(catchError((error: any) => {

      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          authService.signOut();
        }
      }

      return throwError(error);

    }));
};


// export const RequestLogInterceptorService: HttpInterceptorFn = (request, next) => {
//   const authService = inject(AuthService)

  
//   if(request.url.startsWith('https://localhost:') || request.url.startsWith('https://popcoin') ||  request.url.startsWith('https://api.popcoin')){
//     console.log('REQLOGGER:: request.url: ', request.url, new Date())
    
//   }
  


//   return next(request)
//     .pipe(catchError((error: any) => {

//       if (error instanceof HttpErrorResponse) {
//         if (error.status === 429) {
//           console.log('REQLOGGER:: 429 ERROR -RATE LIMIT: request.url: ', request.url, new Date())
//         }
//       }

//       return throwError(error);

//     }));
// };


