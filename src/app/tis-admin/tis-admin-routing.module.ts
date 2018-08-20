import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../shared/service/auth-guard.service";
import { AuthService } from "../shared/service/auth.service";

import { UsersComponent } from "./users/users.component";
import {TisAdminComponent} from "./tis-admin.component";

const routes: Routes = [
  {
    path: 'tis-admin',
    component: TisAdminComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        children: [
          // { path: 'users/:page', component: UsersComponent },
          // { path: 'users', redirectTo: '/tis-admin/users/1', pathMatch: 'full'},
          { path: '', redirectTo: '/tis-admin/users/1', pathMatch: 'full'}
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
  ],
  providers: [
    AuthGuardService,
    AuthService
  ]
})
export class TisAdminRoutingModule { }
