// src/app/logged-in.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';

@Component({
  standalone: true,
  selector: 'app-logged-in',
  imports: [CommonModule],
  template: `
    <section>
      <h2>Bem-vinda ao BIMWorkplace 👋</h2>

      <p *ngIf="username; else noUser">
        Você está logada como <strong>{{ username }}</strong>.
      </p>

      <ng-template #noUser>
        <p>Usuário não identificado no token.</p>
      </ng-template>

      <p>
        Use o menu acima para acessar a tela de <strong>Google Drive</strong>
        e listar os arquivos disponíveis pela service account.
      </p>

      <button (click)="logout()">Sair</button>
    </section>
  `
})
export class LoggedInComponent {
  username: string | null = null;

  constructor(private msalService: MsalService) {
    const account = this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (account) {
      this.username = account.username ?? account.name ?? null;
      this.msalService.instance.setActiveAccount(account);
    }
  }

  logout() {
    this.msalService.logoutRedirect();
  }
}
