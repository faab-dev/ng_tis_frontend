import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild
} from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { Token } from '../interface/token';

@Injectable()
export class AuthGuardService {
  private url_front: string = '/';
  constructor(
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    if ( environment.url_front !== '' ) {
      this.url_front = environment.url_front;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {



    /*if ( this.authService.first_load ) {
      this.authService.initData();
    }*/

    let controller = '';
    if ( route.url && route.url[0] && route.url[0].path ) {
      controller = route.url[0].path;
    }
    console.log('controller');
    console.log(controller);
    // debugger;
    if ( controller === 'login' ) {
      return this.checkLogggedOutArea();
    }


    return this.checkLoggedInArea(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.canActivate(route, state);
  }
  checkLoggedInArea( url: string ): Observable<boolean> {

    debugger;
    return new Observable<boolean> ( observer => {
      this.router.navigate(['/login']);
      observer.next(false);
    });


  }

  checkLogggedOutArea(): Observable<boolean> {

    return new Observable<boolean> ( observer => {

      if ( !this.authService.first_load ) {
        debugger;
        // this.router.navigate(['/installer/devices']);
        // @TODO check this.authService.is_logged_in
        observer.next(true);
      } else {

        this.authService.is_logged_in = false;
        this.authService.getInitData().subscribe( init_data => {
          if ( !init_data || !init_data.url_ars_be || !init_data.x_oe_app_key ) {
            this.router.navigate(['/not-accessible']);
            observer.next(false);
          } else {
            this.authService.url_ars_be = init_data.url_ars_be;
            this.authService.x_oe_app_key = init_data.x_oe_app_key;

            const token_cookie = this.cookieService.getCookie('token');
            let has_uapp_key = false,
              has_valid_token = false;

            if ( token_cookie ) {
              const token: Token = JSON.parse(token_cookie);
              if ( token.x_oe_uapp_key ) {
                this.authService.x_oe_uapp_key = token.x_oe_uapp_key;
                has_uapp_key = true;
                if ( token.user_id && token.access_token ) {
                  has_valid_token = true;
                }
              }
            }
            if ( !has_uapp_key ) {
              const newUapp = {
                platform: 'WEB',
                // TODO implemet current lang
                locale: 'ru',
                data: this.authService.helperBrowserInfoGet()
              };
              this.authService.postUapp(newUapp)
                .subscribe(uapp => {
                  if ( !uapp || !uapp.id ) {
                    this.router.navigate(['/not-accessible']);
                    observer.next(false);
                  } else {
                    this.authService.x_oe_uapp_key = uapp.id;
                    this.cookieService.setCookie('token', {x_oe_uapp_key: uapp.id})
                    this.authService.first_load = false;
                    observer.next(true);
                  }
                });
            }

            if ( !has_valid_token ) {
              this.cookieService.setCookie('token', {x_oe_uapp_key: this.authService.x_oe_uapp_key})
              this.authService.first_load = false;
              observer.next(true);
            } else {

              this.cookieService.setCookie('token', {x_oe_uapp_key: this.authService.x_oe_uapp_key})
              this.authService.first_load = false;
              observer.next(true);
              /*debugger;
              this.authService.is_logged_in = true;
              this.router.navigate(['/installer/devices']);
              observer.next(false);*/
            }
          }
        });
      }
    });


  }

  logout( message: string ){
    console.log('Auth-Guard :: ' + message)
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
