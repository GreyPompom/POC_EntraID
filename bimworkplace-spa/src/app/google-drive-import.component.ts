import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleDriveService, GoogleDriveFile } from './services/google-drive.service';
import { GoogleAuthService } from './services/google-auth.service';

@Component({
  standalone: true,
  selector: 'app-google-drive-import',
  imports: [CommonModule],
  template: `
    <section>
      <h2>Google Drive - Importação</h2>

      <button (click)="connectGoogle()">Conectar com Google Drive</button>
      <button (click)="loadFiles()">Carregar arquivos</button>

      <p *ngIf="loading">Carregando arquivos...</p>
      <p *ngIf="error" style="color: red;">{{ error }}</p>

      <table *ngIf="files.length > 0 && !loading">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Tamanho</th>
            <th>Modificado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let f of files">
            <td>{{ f.name }}</td>
            <td>{{ f.mimeType }}</td>
            <td>{{ f.size || '-' }}</td>
            <td>{{ f.modifiedTime | date: 'short' }}</td>
            <td>
              <button (click)="download(f)">Baixar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class GoogleDriveImportComponent {
  files: GoogleDriveFile[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private driveService: GoogleDriveService,
    private googleAuth: GoogleAuthService
  ) { }

  connectGoogle() {
    this.googleAuth.connectDrive();
  }

  loadFiles() {
    this.loading = true;
    this.error = null;

    this.driveService.listFiles().subscribe({
      next: (res) => {
        this.files = res.files;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.message || 'Erro ao carregar arquivos.';
        this.loading = false;
      }
    });
  }

  download(file: GoogleDriveFile) {
    this.driveService.downloadFile(file).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro bruto ao baixar arquivo:', err);

        if (err.error instanceof Blob && err.error.type === 'application/json') {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result as string);
              console.error('Detalhe do erro Google Drive:', json);
              this.error = json.error?.message || 'Erro ao baixar arquivo.';
            } catch {
              this.error = 'Erro ao baixar arquivo.';
            }
          };
          reader.readAsText(err.error);
        } else {
          this.error = err.message || 'Erro ao baixar arquivo.';
        }
      }
    });
  }

}



