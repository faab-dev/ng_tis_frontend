import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { tap, delay, catchError, map, retry } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { CookieService } from '../service/cookie.service';
import { User } from './../class/user';
import { InitData } from '../interface/init-data';
import { Uapp } from '../interface/uapp';
import { SignInRequest } from '../interface/sign-in-request';
import { SignInResponse } from '../interface/sign-in-response';
import {LoginFormComponent} from '../../login/login-form/login-form.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url_front: string = '';
  private url_init_data: string = 'init-data';
  private url_uapp = 'user/app';
  private url_sign_in = 'signinlogin';
  private url_get_user: string = 'user';
  private url: string;
  first_load: boolean = true;
  is_logged_in: boolean = false;
  when_checked: number = 0;
  redirect_url: string;
  // init data
  url_ars_be: string = '';
  x_oe_app_key: string = '';
  // cookie token
  x_oe_uapp_key: string = '';
  user_id: string = '';
  access_token: string = '';



  roles: object[];
  access: object[];
  type: string;
  login: string;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ){
    this.url = 'url';
    if ( environment.url_front !== '' ) {
      this.url_front = environment.url_front;
    }
  }

  /** GET user by id. Will 404 if id not found */
  getUser(id: string, access_token:string): Observable<User> {

    const url = `${this.url + '/' + this.url_get_user}/${id}`,
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.x_oe_app_key,
          'X-OE-UAPP-KEY': this.x_oe_uapp_key,
          'Authorization': this.access_token
        })
      };
    return this.http.get<User>(url, httpOptions).pipe(
      tap(_ => console.log(`fetched user id=${id}`)),
      catchError(this.handleError<User>(`getUser id=${id}`))
    );

  }

  getInitData(): Observable<InitData> {
    return this.http.get<InitData>(this.url_front + '/' + this.url_init_data).pipe(
      tap(_ => console.log('get init data')),
      catchError(this.handleError<InitData>('error by get init data'))
    );
  }

  getUserWithBrowserData() {
    const url = this.url_ars_be + '/' + this.url_get_user + '/' + this.user_id,
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.x_oe_app_key,
          'X-OE-UAPP-KEY': this.x_oe_uapp_key,
          'Authorization': this.access_token
        })
      };
    return this.http.get(url, httpOptions)
      .pipe(map(user => {
        if ( !user ) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('currentUser', JSON.stringify(user));
          // @TODO make error
          return {
            error: true
          };
        }
        console.log("user");
        console.log(user);
        debugger;
        return {
          error: false
        };
      }));
      /*.pipe(
      tap(_ => console.log('fetched user id=' + this.user_id)),
      catchError(this.handleError('getUser id=' + this.user_id))
    );*/
  }
  /** POST: add an app to the database */
  postUapp (uapp): Observable<Uapp> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'X-OE-APP-KEY': this.x_oe_app_key
      })
    };
    return this.http.post<Uapp>(this.url_ars_be + '/' + this.url_uapp, uapp, httpOptions)
      .pipe(
        catchError(this.handleError('postUapp', uapp))
      );
  }
  postSignIn (sign_in_request: SignInRequest) {
    console.log('sign_in_request');
    console.log(sign_in_request);
    return this.http.post(this.url_front + '/' + this.url_sign_in, sign_in_request)
      .pipe(retry(3), map(
        (response: SignInResponse) => {
          if ( !response || !response.access_token || !response.user_id ) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            // localStorage.setItem('currentUser', JSON.stringify(user));
            // @TODO make error
            return {
              error: true
            };
          }
          this.user_id = response.user_id;
          this.access_token = response.access_token;
          this.cookieService.setCookie('token', {
            x_oe_uapp_key: this.x_oe_uapp_key,
            user_id: this.user_id,
            access_token: this.access_token
          });
        }
      ));
      /*.pipe(
        catchError(this.handleError('postUapp', sign_in_request))
      );*/
  }

  actionLogin(): Observable<boolean> {
    return of(true).pipe(
      delay(1000),
      tap(val => this.is_logged_in = true)
    );
  }

  setAuthData(user, auth): boolean{
    if (
      typeof user.id === 'string'
      && Array.isArray(user.roles)
      && Array.isArray(user.access)
      && typeof user.login === 'string'
      && typeof user.type === 'string'
      && typeof auth.access_token === 'string'
    ) {
      this.user_id = user.id;
      this.roles = user.roles;
      this.access = user.access;
      this.login = user.login;
      this.type = user.type;
      this.access_token = auth.access_token;
      this.is_logged_in = true;
      this.when_checked = Math.floor(Date.now() / 1000);
      return true;
    } else {
      return false;
    }
  }

  getAccessToken(): string {
    return this.access_token;
  }

  getLogin(): string {
    return this.login;
  }

  private resetAuthData(){
    this.user_id = '';
    this.roles = [];
    this.access = [];
    this.login = '';
    this.type = '';
    this.access_token = '';
  }

  logout(): void {
    this.resetAuthData();
    window.localStorage.removeItem('token');
    this.is_logged_in = false;
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.log(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  helperBrowserInfoGet(): string {
    const ua = navigator.userAgent;
    let tem,
      os = '',
      lang = '',
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [];
    if ( typeof navigator.platform !== typeof undefined ) {
      os = navigator.platform + ' ';
    }
    if ( typeof navigator.language !== typeof undefined ){
      lang = ' ' + navigator.language;
    }
    if ( /trident/i.test(M[1]) ) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE version: ' + ( tem[1] || '' );
    }
    if ( M[1] === 'Chrome' ) {
      tem = ua.match(/\bOPR\/(\d+)/)
      if ( tem != null ) {
        return 'Opera version: ' + tem[1];
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ( ( tem = ua.match(/version\/(\d+)/i) ) != null ) {
      M.splice(1, 1, tem[1]);
    }
    return os + M[0] + ' ' + M[1] + lang;
  }
}
