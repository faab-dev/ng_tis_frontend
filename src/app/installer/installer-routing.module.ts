import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InstallerComponent } from './installer.component';
/*import { AdminDashbordComponent } from './admin-dashbord/admin-dashbord.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageHotelsComponent } from './manage-hotels/manage-hotels.component';*/

import { AuthGuardService } from './../shared/service/auth-guard.service';
// import {HotelsComponent} from "./hotels/hotels.component";

const installerRoutes: Routes = [
  {
    path: 'installer',
    component: InstallerComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuardService],
        children: [
          /*{ path: 'users/:page', component: ManageUsersComponent },
          // { path: 'hotels', redirectTo: 'hotels/1' },
          { path: 'dashbord', component: AdminDashbordComponent},*/
          { path: '', redirectTo: '/installer/devices/1', pathMatch: 'full'}
        ]
      }

    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(installerRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class InstallerRoutingModule { }
