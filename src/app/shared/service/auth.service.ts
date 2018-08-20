import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, of, ObservableInput, throwError } from 'rxjs';
import { tap, delay, catchError, map, retry, retryWhen, scan, flatMap, first } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { CookieService } from '../service/cookie.service';
import { User } from './../class/user';
import { AuthPhone, Operator } from "../class";
import { LoginErrors } from "../enum";
import { FrontRequestBody, FrontRequestSignin, FrontResponseInitData, FrontResponseSignin, HttpVoidResponse, Uapp } from "../interface";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url_front: string = '/api.php';
  private url_init_data: string = 'init-data';
  private url_uapp = 'user/app';
  private url_signin_form = 'signinlogin';
  private url_signin_phone = 'user/phone/signin';
  private url_token_refresh = 'refresh-token';
  private url_get_user: string = 'user';
  private url_get_otp: string = 'user/phone/request/otp';
  first_load: boolean = true;
  is_logged_in: boolean = false;
  when_checked: number = 0;
  redirect_url: string;
  path_logged_out:string = 'login/form';
  path_not_accessible:string = 'not-accessible';
  path_installer:string = 'installer';
  path_tis_admin:string = 'tis-admin';
  path_default;
  // init data
  url_ars_be: string = '';
  x_oe_app_key: string = '';
  // cookie token
  x_oe_uapp_key: string = '';
  user_id: string = '';
  access_token: string = '';
  // user data
  user_is_installer: boolean = false;
  user_is_tis_admin: boolean = false;
  user_name: string;
  user_auth_phone: AuthPhone;
  current_operator: Operator;
  available_operators: Operator[];



  roles: object[];
  access: object[];
  type: string;
  login: string;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private location: Location
  ){}



  getOtp(number: string): Observable<HttpVoidResponse>{
    const url = this.url_ars_be + '/' + this.url_get_otp + '/' + number,
      http_options = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.x_oe_app_key,
          'X-OE-UAPP-KEY': this.x_oe_uapp_key
        })
      };
    return this.http.get(url, http_options)
      .pipe(map( () => {
        return {
          error: false
        } as HttpVoidResponse;
      }));
  }

  getUserWithBrowserData(): Observable<HttpVoidResponse>{
    console.log('getUserWithBrowserData');
    const url = this.url_ars_be + '/' + this.url_get_user + '/' + this.user_id,
      http_options = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'X-OE-APP-KEY': this.x_oe_app_key,
          'X-OE-UAPP-KEY': this.x_oe_uapp_key,
          'Authorization': this.access_token
        })
      };
    return this.http.get(url, http_options)
      .pipe(
        /*retryWhen(
          this._retryWhen()
        ),*/
        map( (user: User) => {
          console.log('getUserWithBrowserData map');
        console.log('user');
        console.log(user);

        if ( !user ) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('currentUser', JSON.stringify(user));
          // @TODO make error
          return {
            error: true
          };
        }

        this.user_name = (user.name) ? user.name : (user.login) ? user.login : '';
        let data_length = user.authPhones.length;
        for ( let i = 0; i < data_length; i++ ){
            const auth_phone = user.authPhones[i];
          // @TODO develop class auth phone (not finished)
            if( !auth_phone.approved ){
              continue;
            }
            this.user_auth_phone = auth_phone;
            break;
        }

        data_length = user.roles.length;
        for ( let i = 0; i < data_length; i++ ){
          const role = user.roles[i];
          if( !role.name ){
            continue;
          }
          if( role.name === 'INSTALLER' ){
            this.user_is_installer = true;
            continue;
          }
          if( role.name === 'TIS_ADMIN' ){
            this.user_is_installer = true;
            this.user_is_tis_admin = true;
            break;
          }
        }

        this.available_operators = user.availableOperators;

        if( this.available_operators.length === 0 ){
          throw new Error(LoginErrors.USER_HAS_NOT_OPERATOR);
        }

        if( !this.user_is_installer && !this.user_is_tis_admin ){
          throw new Error(LoginErrors.USER_HAS_NOT_PERMISSIONS);
        }

        this.is_logged_in = true;
        this.path_default = this.path_installer;
        if( this.user_is_tis_admin ){
          this.path_default = this.path_tis_admin;
        }
        return {error: false} as HttpVoidResponse;
      })

      );
      /*.pipe(
      tap(_ => console.log('fetched user id=' + this.user_id)),
      catchError(this.handleError('getUser id=' + this.user_id))
    );*/
  }
  /** POST: add an app to the database */
  postUapp (uapp): Observable<Uapp> {
    const http_options = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'X-OE-APP-KEY': this.x_oe_app_key
      })
    };
    return this.http.post<Uapp>(this.url_ars_be + '/' + this.url_uapp, uapp, http_options)
      .pipe(
        catchError(this.handleError('postUapp', uapp))
      );
  }
  postFrontInitData(): Observable<HttpVoidResponse> {
    console.log('postFrontInitData');
    const body = {controller: 'init-data', data: {}} as FrontRequestBody;
    return this.http.post<HttpVoidResponse>(this.url_front, body).pipe(
      retryWhen(
        this._retryWhen()
      ),
      map( (init_data: FrontResponseInitData) => {
        console.log('postFrontInitData map');
        if( !init_data || !init_data.url_ars_be || !init_data.x_oe_app_key ){
          return {
            error: true
          } as HttpVoidResponse;
        }
        this.url_ars_be = init_data.url_ars_be;
        this.x_oe_app_key = init_data.x_oe_app_key;
        return {
          error: false
        } as HttpVoidResponse;
      })
    );
  }
  postFrontSignInForm (sign_in_request: FrontRequestSignin): Observable<HttpVoidResponse>{
    console.log('postFrontSignInForm');
    const body = {controller: 'signin-form', data: sign_in_request} as FrontRequestBody;
    return this.http.post<HttpVoidResponse>(this.url_front, body)
      .pipe(
        retryWhen(
          this._retryWhen()
        ),
        map(
        (response: FrontResponseSignin) => {
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
          return {error: false} as HttpVoidResponse;
        }
      ));
      /*.pipe(
        catchError(this.handleError('postUapp', sign_in_request))
      );*/
  }
  postFrontSignInPhone (sign_in_request: FrontRequestSignin): Observable<HttpVoidResponse>{
    console.log('postFrontSignInPhone');
    const body = {controller: 'signin-phone', data: sign_in_request} as FrontRequestBody;
    return this.http.post<HttpVoidResponse>(this.url_front, body)
      .pipe(retry(3), map(
        (response: FrontResponseSignin) => {
          console.log('postFrontSignInPhone map');
          this.user_id = response.user_id;
          this.access_token = response.access_token;
          this.cookieService.setCookie('token', {
            x_oe_uapp_key: this.x_oe_uapp_key,
            user_id: this.user_id,
            access_token: this.access_token
          });
          return {error: false} as HttpVoidResponse;
        }
      ));
    /*.pipe(
      catchError(this.handleError('postUapp', sign_in_request))
    );*/
  }
  postFrontTokenRefresh (): Observable<string>{
    console.log('postFrontTokenRefresh');
    const body = {
      controller: 'refresh-token',
      data: {
        user_id: this.user_id,
        access_token: this.access_token,
        x_oe_uapp_key: this.x_oe_uapp_key
      }
    } as FrontRequestBody;
    return this.http.post<string>(this.url_front, body)
      .pipe(
        map( (response: FrontResponseSignin) => {
          console.log('postFrontTokenRefresh MAP');
          this.user_id = response.user_id;
          this.access_token = response.access_token;
          this.cookieService.setCookie('token', {
            x_oe_uapp_key: this.x_oe_uapp_key,
            user_id: this.user_id,
            access_token: this.access_token
          });
          console.log('this.access_token');
          console.log(this.access_token);
          return this.access_token;
        } )
        // This functionality is implemented in RefreshTokenInterceptor
        /*,
        catchError(
          (error) => {
            debugger;
            console.log('postFrontTokenRefresh ERROR');
            this.logout();
            this.router.navigate([ '/' + this.path_logged_out ]);
            return error;
          }
        )*/
      );
  }

  actionLogin(): Observable<boolean> {
    return of(true).pipe(
      delay(1000),
      tap(val => this.is_logged_in = true)
    );
  }

  actionLogout(): void {
    this.is_logged_in = false;
    this.path_default = this.path_logged_out;
    this.cookieService.setCookie('token', {
      x_oe_uapp_key: this.x_oe_uapp_key
    });
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
    this.user_id = '';
    this.roles = [];
    this.access = [];
    this.login = '';
    this.type = '';
    this.access_token = '';
    this.is_logged_in = false;

    this.cookieService.setCookie('token', {
      x_oe_uapp_key: this.x_oe_uapp_key
    });

    this.router.navigate(['/' + this.path_logged_out]);
  }

  private _retryWhen(){
    console.log('_retryWhen');
    return scan((error_count, err: HttpErrorResponse) => {

        // [500, 502, 503, 504].indexOf(err.status) < 0
        if ( err.status < 500 ){
          throwError(err);
        }
        if( error_count < 10 ){
          delay(1000);
          return error_count +1;
        }

        throw new Error(LoginErrors.HTTP_SERVER_IS_NOT_AVAILABLE);

      }

      , 0)
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

  _samePath(): string {
    return this.location.path().split('?')[0].split('#')[0];
  }

}
