import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../shared/service/auth-guard.service';
import { AuthService } from '../shared/service/auth.service';
import { LoginComponent } from './login.component';
import { LoginChoiceComponent } from './login-choice/login-choice.component';
import { LoginPhoneComponent } from './login-phone/login-phone.component';
import { LoginQRComponent } from './login-qr/login-qr.component';
import { LoginFormComponent } from './login-form/login-form.component';
import {UsersComponent} from "../tis-admin/users/users.component";

/*const loginRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuardService], }
];*/

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        // canActivateChild: [AuthGuardService],
        children: [
          /*{ path: 'users/:page', component: ManageUsersComponent },*/
          { path: 'form', component: LoginFormComponent},
          { path: 'qr', component: LoginQRComponent},
          { path: 'phone', component: LoginPhoneComponent},
          { path: '', component: LoginChoiceComponent }
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
export class LoginRoutingModule { }
