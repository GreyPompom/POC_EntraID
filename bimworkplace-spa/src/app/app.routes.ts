import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoggedInComponent } from './logged-in.component';
import { GoogleDriveImportComponent } from './google-drive-import.component';

export const routes: Routes = [
  {
    path: 'logged-in',
    component: LoggedInComponent,
    canActivate: [MsalGuard]
  },
  {
    path: 'drive-import',
    component: GoogleDriveImportComponent,
    canActivate: [MsalGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'logged-in'
  },
  {
    path: '**',
    redirectTo: 'logged-in'
  }
];
