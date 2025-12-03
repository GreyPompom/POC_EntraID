import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
declare const google: any; // para o TypeScript não reclamar do objeto global

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private tokenClient: any;
  private accessToken: string | null = null;


  private clientId = environment.googleClientId;
  init() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'openid profile https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.access_token) {
          this.accessToken = response.access_token;
          console.log('Google access token:', this.accessToken);
        } else {
          console.error('Erro ao obter access token do Google', response);
        }
      }
    });
  }

  connectDrive() {
    if (!this.tokenClient) {
      this.init();
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}
