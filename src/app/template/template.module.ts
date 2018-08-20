import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from "@angular/router";

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormErrorComponent } from './form/form-error/form-error.component';
import { FormPhoneNumberComponent } from './form/form-phone-number/form-phone-number.component';
import { ListPaginatorComponent } from './list/list-paginator/list-paginator.component';
import { ListSortComponent } from './list/list-sort/list-sort.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    FormErrorComponent,
    FormPhoneNumberComponent,
    ListPaginatorComponent,
    ListSortComponent
  ],
  declarations: [
    FormErrorComponent,
    FormPhoneNumberComponent,
    ListPaginatorComponent,
    ListSortComponent
  ]
})
export class TemplateModule { }
