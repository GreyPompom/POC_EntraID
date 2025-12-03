// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // ajuste se o arquivo tiver outro nome

import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService
} from '@azure/msal-angular';

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, msalGuardConfig, msalInterceptorConfig } from './app/msal-config';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

export function MSALInstanceFactory() {
  return new PublicClientApplication(msalConfig);
}
export function initializeMsalFactory(msalInstance: PublicClientApplication) {
  return async () => {
    console.log(' iniciando MSAL...');
    await msalInstance.initialize();

    const redirectResult = await msalInstance.handleRedirectPromise();
    console.log(' MSAL inicializado, redirecionando=', redirectResult);

    (window as any).msalInstance = msalInstance; //so pra debugar no console

    if (redirectResult && (redirectResult.account || redirectResult.accessToken)) {
      try {
        sessionStorage.setItem('redirecionar', '1');
      } catch (e) {  }
    }
  };
}


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsalFactory,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: msalGuardConfig
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: msalInterceptorConfig
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
}).catch(err => console.error(err));
