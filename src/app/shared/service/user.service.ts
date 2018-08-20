import { Injectable } from '@angular/core';
import {Observable, throwError as observableThrowError} from "rxjs/index";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { User } from "../class/user";
import {catchError, map, tap} from "rxjs/operators";

import { AuthService } from "./auth.service";
import {HttpFullResponse, FrontResponseSignin, PaginatorPage} from "../interface";
import {ListQuery} from "../interface/list-query";
import {ListPaginatorComponent} from "../../template/list/list-paginator/list-paginator.component";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url_list = 'users/role/INSTALLER';
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /*getUser(id: string, access_token:string): Observable<User> {

    const url = `${this.url + '/' + this.url_get_user}/${id}`,
      http_options = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.x_oe_app_key,
          'X-OE-UAPP-KEY': this.x_oe_uapp_key,
          'Authorization': this.access_token
        })
      };
    return this.http.get<User>(url, http_options).pipe(
      tap(_ => console.log(`fetched user id=${id}`)),
      catchError(this.handleError<User>(`getUser id=${id}`))
    );

  }*/

  getUsers(page_paginator: PaginatorPage, query_params: ListQuery): Observable<HttpFullResponse> {

    const first = (page_paginator.number - 1) * page_paginator.size,
      max = page_paginator.size;

    console.log('url_ars_be');
    console.log(this.authService.url_ars_be);

    const url = `${this.authService.url_ars_be}/${this.url_list}?available&first=${first}&max=${max}${this._gerSort(query_params)}`,
      hed: HttpHeaders = new HttpHeaders({
        'Content-Type':  'application/json',
        'X-OE-APP-KEY': this.authService.x_oe_app_key,
        'X-OE-UAPP-KEY': this.authService.x_oe_uapp_key,
        'Authorization': this.authService.access_token
      });
      /*http_options = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.authService.x_oe_app_key,
          'X-OE-UAPP-KEY': this.authService.x_oe_uapp_key,
          'Authorization': this.authService.access_token
        }),
        observe: 'response'
      };*/
    return this.http.get<HttpFullResponse>(url, {
      headers: hed,
      observe: 'response'
    }).pipe(
      map(
        (response: HttpResponse<User[]>) => {
          console.log('response');
          console.log(response);
          const count = parseInt(response.headers.get('X-TOTAL-COUNT'));
          if( isNaN(count) ){
            return observableThrowError('Wrong header: X-TOTAL-COUNT');
          }
          return {
            body: response.body as User[],
            count: parseInt(response.headers.get('X-TOTAL-COUNT'))
          } as HttpFullResponse;

        }

      )
    );

  }

  private _gerSort(query_params: ListQuery): string {
    return ( query_params.sort && query_params.direction ) ? `&sort=${query_params.sort}&direction=${query_params.direction}`: '';
  }
}
