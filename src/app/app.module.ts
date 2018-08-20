import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';


import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { LoginModule } from './login/login.module';
import { InstallerModule } from './installer/installer.module';
import { TisAdminModule } from "./tis-admin/tis-admin.module";
import { AppRoutingModule } from './app-routing.module';

import { LanguageService } from './shared/service/language.service';
import { PageNotAccessibleComponent } from './page-not-accessible/page-not-accessible.component';
import { RefreshTokenInterceptor } from "./shared/interceptor/refresh-token.interceptor";



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    PageNotAccessibleComponent
    // FormatMillisecondsPipe
  ],
  exports: [
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    // BsDropdownModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LoginModule,
    InstallerModule,
    TisAdminModule,
    AppRoutingModule

  ],
  providers: [
    LanguageService, {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
