import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users/users.component';
import { TisAdminComponent } from "./tis-admin.component";
import { TisAdminRoutingModule } from "./tis-admin-routing.module";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { UsersModule } from "./users/users.module";
import { TemplateModule } from "../template/template.module";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    UsersModule,
    TisAdminRoutingModule
  ],
  declarations: [
    TisAdminComponent
  ],
  exports: [],
  providers: []
})
export class TisAdminModule { }
