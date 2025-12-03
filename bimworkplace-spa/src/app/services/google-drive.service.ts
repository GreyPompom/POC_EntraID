// src/app/services/google-drive.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { GoogleAuthService } from './google-auth.service';

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
  ) { }

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
      .set('q', 'trashed = false');

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

    // Se for arquivo do Google Docs, Sheets, Slides etc → usar EXPORT
    if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
      let exportMime = 'application/pdf';

      switch (file.mimeType) {
        case 'application/vnd.google-apps.document': // Google Docs
          exportMime = 'application/pdf';
          break;
        case 'application/vnd.google-apps.spreadsheet': // Sheets
          exportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'application/vnd.google-apps.presentation': // Slides
          exportMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        // outros tipos vão como PDF
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

    // Arquivos “normais” → download direto
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
