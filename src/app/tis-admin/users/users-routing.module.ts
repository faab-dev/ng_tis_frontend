import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService, AuthService } from "../../shared/service";
import { UsersComponent } from "./users.component";

const routes: Routes = [
  {
    path: 'tis-admin/users/:page',
    component: UsersComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'tis-admin/users',
    redirectTo: '/tis-admin/users/1', //This will make sure that we are always redirected to the first page
    pathMatch: 'full'
  },
];


/*const routes: Routes = [
  {
    path: 'tis-admin/users',
    component: UsersComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        children: [
          { path: ':page', component: UsersComponent },
          { path: '', redirectTo: '/tis-admin/users/1', pathMatch: 'full'}
        ]
      }

    ]
  }
];*/

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
export class UsersRoutingModule { }
