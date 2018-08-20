import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './../../shared/service/auth-guard.service';
import { InstallerComponent } from '../installer.component';
import { DevicesComponent } from './devices.component';
/*import {HotelsCreateComponent} from "./hotels-create/hotels-create.component";
import {HotelsEditComponent} from "./hotels-edit/hotels-edit.component";
import {HotelsCopyComponent} from "./hotels-copy/hotels-copy.component";*/

const routes: Routes = [
  {
    path: 'installer/devices',
    component: InstallerComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuardService],
        children: [
          { path: 'create', component: DevicesComponent },
          /*{ path: 'edit',  redirectTo: '1', pathMatch: 'full' },
          { path: 'edit/:hotel_id', component: HotelsEditComponent },
          { path: 'copy',  redirectTo: '1', pathMatch: 'full' },
          { path: 'copy/:hotel_id', component: HotelsCopyComponent },*/
          { path: ':page', component: DevicesComponent },
          { path: '', redirectTo: '1', pathMatch: 'full'}
        ]
      }

    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DevicesRoutingModule { }
