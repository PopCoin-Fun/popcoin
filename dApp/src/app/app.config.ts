import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async'
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { AuthInterceptorService } from './services/auth-interceptor.service';// RequestLogInterceptorService
import { graphqlProvider } from './graphql.provider';
// import { RequestLoggerInterceptor } from './interceptors/httpInterceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    // provideHttpClient(withFetch()),
    provideHttpClient(withFetch(), withInterceptors([AuthInterceptorService, ])), // RequestLogInterceptorService
    provideAnimationsAsync(),
    CommonModule,
    NgxSpinnerModule, 
    provideHttpClient(),  
    graphqlProvider,
    
    // { provide: HTTP_INTERCEPTORS, useClass: RequestLoggerInterceptor, multi: true }
  ]
};
