import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { GoogleAuthService } from './services/google-auth.service';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
}

@Injectable({ providedIn: 'root' })
export class GoogleDriveService {
  private driveApiUrl = 'https://www.googleapis.com/drive/v3/files';

  constructor(
    private http: HttpClient,
    private googleAuth: GoogleAuthService
  ) {}

  listFiles(): Observable<{ files: GoogleDriveFile[] }> {
    const token = this.googleAuth.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Google access token não encontrado. Conecte o Drive primeiro.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('pageSize', '50')
      .set('fields', 'files(id,name,mimeType,size,modifiedTime)')
      .set('q', 'trashed = false')
      .set('includeItemsFromAllDrives', 'true')
      .set('supportsAllDrives', 'true');

    return this.http.get<{ files: GoogleDriveFile[] }>(this.driveApiUrl, { headers, params });
  }

  downloadFile(file: GoogleDriveFile): Observable<Blob> {
    const token = this.googleAuth.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Google access token não encontrado. Conecte o Drive primeiro.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // 🔹 Caso 1: arquivos nativos do Google (Docs, Sheets, Slides...)
    if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
      let exportMime = 'application/pdf';

      // mapeia alguns tipos comuns
      switch (file.mimeType) {
        case 'application/vnd.google-apps.document': // Google Docs
          exportMime = 'application/pdf'; // ou 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          break;
        case 'application/vnd.google-apps.spreadsheet': // Google Sheets
          exportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'application/vnd.google-apps.presentation': // Google Slides
          exportMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        // outros tipos podem continuar como PDF
      }

      const url = `${this.driveApiUrl}/${file.id}/export`;
      const params = new HttpParams()
        .set('mimeType', exportMime)
        .set('supportsAllDrives', 'true');

      return this.http.get(url, {
        headers,
        params,
        responseType: 'blob'
      });
    }

    // 🔹 Caso 2: arquivos "normais" (pdf, imagem, zip etc)
    const url = `${this.driveApiUrl}/${file.id}`;
    const params = new HttpParams()
      .set('alt', 'media')
      .set('supportsAllDrives', 'true');

    return this.http.get(url, {
      headers,
      params,
      responseType: 'blob'
    });
  }
}
