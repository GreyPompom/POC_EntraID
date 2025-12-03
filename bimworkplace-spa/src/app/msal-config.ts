// src/app/msal-config.ts
import { BrowserCacheLocation } from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from '../environments/environment';

export const SPA_CLIENT_ID = environment.entraClientId;
export const API_CLIENT_ID = environment.apiClientId;
export const TENANT_ID = environment.entraTenantId;

export const msalConfig = {
  auth: {
    clientId: SPA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: 'http://localhost:4200',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) { return; }
        // console.log(message);
      }
    }
  }
};

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    `api://${API_CLIENT_ID}/access_as_user`
  ]
};

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: loginRequest.scopes
  }
};

export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, Array<string>>([
    ['https://localhost:5161/api/', [`api://${API_CLIENT_ID}/access_as_user`]]
  ])
};
                              