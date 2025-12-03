// src/app/root.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root-shell',
  imports: [RouterLink, RouterOutlet],
  template: `
    <header>
      <h2>BIMWorkplace - Navegação</h2>
      <nav>
        <a routerLink="/logged-in" routerLinkActive="active">Home</a>
        <a routerLink="/drive-import" routerLinkActive="active">Google Drive</a>
      </nav>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid #ddd;
      margin-top: 1rem;
    }

    nav a {
      margin-left: 1rem;
      text-decoration: none;
    }

    nav a.active {
      font-weight: bold;
      text-decoration: underline;
    }

    main {
      padding: 1.5rem;
    }
  `]
})
export class RootComponent {}
