import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AlertService } from '../shared/service';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { LoginChoiceComponent } from './login-choice/login-choice.component';
import { LoginPhoneComponent } from './login-phone/login-phone.component';
import { LoginQRComponent } from './login-qr/login-qr.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { FormErrorComponent } from '../template/form/form-error/form-error.component';
import {TemplateModule} from '../template/template.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LoginRoutingModule,
    TemplateModule,
  ],
  declarations: [
    LoginComponent,
    LoginChoiceComponent,
    LoginPhoneComponent,
    LoginQRComponent,
    LoginFormComponent
  ],
  providers: [
    AlertService
  ],
  exports: [
    /*FormErrorComponent*/
  ]
})
export class LoginModule { }
