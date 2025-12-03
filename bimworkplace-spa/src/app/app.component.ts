// src/app/app.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { RootComponent } from './root.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RootComponent],
  template: `
    <div style="padding:20px">
      <h1>BIM SPA - POC</h1>

      <div *ngIf="!isAuthenticated">
        <button (click)="login()">Login</button>
      </div>

      <div *ngIf="isAuthenticated">
        <p>Usuário: {{ username }}</p>
        <button (click)="callApi()">Chamar API</button>
        <button (click)="logout()">Logout</button>
      </div>

      <div *ngIf="apiResult">
        <h3>Resposta API</h3>
        <pre>{{ apiResult | json }}</pre>
      </div>

      <!-- 🔽 Navbar + rotas aparecem aqui -->
      <app-root-shell *ngIf="isAuthenticated"></app-root-shell>
      <!-- se quiser ver a navbar mesmo não logada, remove o *ngIf -->
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  username: string | null | undefined = null;
  apiResult: any = null;

  private navigatedAfterLogin = false;
  private subs = new Subscription();

  constructor(
    private msalService: MsalService,
    private msalBroadcast: MsalBroadcastService,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await (this.msalService.instance as any).handleRedirectPromise();
    } catch (e) {
      console.warn('erro :', e);
    }

    console.log('AppComponent initialized');
    const s = this.msalBroadcast.inProgress$
      .pipe(filter((status) => status === InteractionStatus.None))
      .subscribe(() => {
        const accounts = this.msalService.instance.getAllAccounts();
        console.log('Contas ativas após login:', accounts);
        if (accounts.length > 0) {
          console.log('tem conta(s) ativa(s):', accounts);
          this.isAuthenticated = true;
          this.username = accounts[0].username || accounts[0].name;

          const shouldNavigate = sessionStorage.getItem('redirecionar') === '1';

          if (!this.navigatedAfterLogin && shouldNavigate) {
            this.navigatedAfterLogin = true;
            sessionStorage.removeItem('redirecionar');
            console.log('indo para /logged-in ');
            this.router.navigateByUrl('/logged-in').catch(err => console.error(err));
          }
        } else {
          this.isAuthenticated = false;
          this.username = null;
          this.navigatedAfterLogin = false;
        }
      });

    this.subs.add(s);
  }

  login() {
    this.msalService.loginRedirect({
      scopes: ['openid', 'profile', `api://6d66f1da-799e-4d26-851f-eb388682932e/access_as_user`]
    });
  }

  logout() {
    this.msalService.logoutRedirect();
  }

  callApi() {
    this.http.get('https://localhost:5161/api/user').subscribe({
      next: res => this.apiResult = res,
      error: err => this.apiResult = { error: err.status, message: err.message }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
