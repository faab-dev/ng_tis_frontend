import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  ActivatedRoute
} from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { Token } from '../interface/token';
import {HttpVoidResponse} from "../interface/http-void-response";
import {ComponentStatus, Lang, ListSortDirection, LoginErrors} from "../enum";
import {ValidationErrors} from "@angular/forms";
import {first} from "rxjs/operators";
import {ListQuerySort} from "../interface";
import {LanguageService} from "./language.service";
import {ListUsersSortProperty} from "../enum/list-users-sort-property.enum";

@Injectable()
export class AuthGuardService {
  private url_front: string = '/api.php';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private languageService: LanguageService
  ) {
    /*if ( environment.url_front !== '' ) {
      this.url_front = environment.url_front;
    }*/
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    /*if ( this.authService.first_load ) {
      this.authService.initData();
    }*/

    // debugger;
    const current_url = state.url



    console.log('current_url');
    console.log(current_url);


    const route_url_0 = (route.url[0] && route.url[0].path) ? route.url[0].path : null;
    const route_url_1 = (route.url[1] && route.url[1].path) ? route.url[1].path : null;


    console.log('route_url_0');
    console.log(route_url_0);

    console.log('route_url_1');
    console.log(route_url_1);
    // debugger;


    let controller = '';
    if ( route.url && route.url[0] && route.url[0].path ) {
      controller = route.url[0].path;
    }
    console.log('controller');
    console.log(controller);
    // debugger;

    switch (controller) {
      case 'login':
        return this.checkLogggedOutArea(route, state);
      case 'tis-admin':
        return this.checkLogggedOutArea(route, state);
      case 'installer':
        return this.checkLogggedOutArea(route, state);
      case 'not-accessible':
        return new Observable<boolean> ( observer => {observer.next(true)});
      default:
        return this.checkLogggedOutArea(route, state);
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.canActivate(route, state);
  }
  checkLoggedInArea( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    return new Observable<boolean> ( observer => {

      // this.checkQueryParams();


      if( !this.authService.first_load ){
        if( this.authService.is_logged_in ){
          debugger;
          observer.next(true);
          return;
        }
        debugger;
        this.authService.actionLogout();
        this.router.navigate(['/'+this.authService.path_default]);
        observer.next(false);
        return;
      }


      this.authService.postFrontInitData().subscribe(
        (http_void_response: HttpVoidResponse) => {

          if ( http_void_response.error ) {
            debugger;
            this.router.navigate(['/'+this.authService.path_not_accessible]);
            observer.next(false);
            return;
          }

          const token_cookie = this.cookieService.getCookie('token');
          let has_uapp_key = false,
            has_valid_token = false;

          if( !token_cookie ){
            debugger;
            this.router.navigate([ '/' + this.authService.path_logged_out ]);
            observer.next(false);
            return;
          }

          const token: Token = JSON.parse(token_cookie);
          if( !token || !token.access_token || !token.user_id || !token.x_oe_uapp_key ){
            debugger;
            this.router.navigate([ '/' + this.authService.path_logged_out ]);
            observer.next(false);
            return;
          }

          this.authService.access_token = token.access_token;
          this.authService.user_id = token.user_id;
          this.authService.x_oe_uapp_key = token.x_oe_uapp_key;

          this.authService.getUserWithBrowserData()
            .pipe(first())
            .subscribe(
              (res: HttpVoidResponse) => {
                if (  !res || res.error ) {
                  this.router.navigate([ '/' + this.authService.path_logged_out ]);
                  observer.next(false);
                }
                debugger;
                this.checkQueryParams(route, state).subscribe(
                  (query_observer: boolean) => {
                    observer.next(query_observer);
                  }
                );
                // debugger;
                // observer.next(true);
              },
              error => {
                debugger;
                this.router.navigate([ '/' + this.authService.path_logged_out ]);
                observer.next(false);
              }
            );
        },
        (error) => {
          debugger;
          this.authService.logout();
          this.router.navigate([ '/' + this.authService.path_logged_out ]);
          observer.next(false);
        }
      );
    });


  }

  checkLogggedOutArea( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<boolean> {
    return new Observable<boolean> ( observer => {



      if ( !this.authService.first_load ) {
        console.log('!this.authService.first_load');
        // this.router.navigate(['/installer/devices']);
        // @TODO check this.authService.is_logged_in
        debugger;
        /*this.checkQueryParams(route, state).subscribe(
          (query_observer: boolean) => {
            observer.next(query_observer);
          }
        );*/
        observer.next(true);
        return;
      } else {

        this.authService.is_logged_in = false;
        this.authService.postFrontInitData().subscribe(
          (http_void_response: HttpVoidResponse) => {
            if ( http_void_response.error ) {
              debugger;
              this.router.navigate(['/'+this.authService.path_not_accessible]);
              observer.next(false);
              return;
            }
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
                    debugger;
                    this.router.navigate(['/'+this.authService.path_not_accessible]);
                    observer.next(false);
                  } else {
                    this.authService.x_oe_uapp_key = uapp.id;
                    this.cookieService.setCookie('token', {x_oe_uapp_key: uapp.id})
                    this.authService.first_load = false;
                    debugger;
                    this.checkQueryParams(route, state).subscribe(
                      (query_observer: boolean) => {
                        observer.next(query_observer);
                      }
                    );
                  }
                });
            }

            if ( !has_valid_token ) {
              // this.cookieService.setCookie('token', {x_oe_uapp_key: this.authService.x_oe_uapp_key})
              this.authService.first_load = false;
              debugger;
              this.checkQueryParams(route, state).subscribe(
                (query_observer: boolean) => {
                  observer.next(query_observer);
                }
              );
            } else {
              this.cookieService.setCookie('token', {x_oe_uapp_key: this.authService.x_oe_uapp_key})
              this.authService.first_load = false;
              debugger;
              this.checkQueryParams(route, state).subscribe(
                (query_observer: boolean) => {
                  observer.next(query_observer);
                }
              );
            }
          },
          (error) => {
            debugger;
            this.router.navigate(['/'+this.authService.path_not_accessible]);
            observer.next(false);
          }
        );
      }
    });
  }

  private checkQueryParams( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) : Observable<boolean> {
    return new Observable<boolean> ( observer => {


      const url_1 = this._getUrl1(route);
      const queryParams_1 = url_1.queryParams;
      const same_path = this.authService._samePath();


      switch (this._getPath(route, 0) ){
        case 'login':
          const params_1 = url_1.queryParams;
          if (typeof params_1.lang === 'string' && Lang[params_1.lang.toUpperCase()] ){
            const lang = params_1.lang as Lang;
            if( this.languageService.current_code !== lang ){
              this.languageService.setLanguage(lang);
            }
            observer.next(true);

          } else {
            /// this.translate.use(query_item_encoded);
            debugger;
            /*this.router.navigate(['.'], {
              queryParams: { lang: this.languageService.current_code },
              queryParamsHandling: "merge" ,
              // preserveQueryParams: true,
              relativeTo: this.activatedRoute
            } )*/


            this.router.navigate([this.authService._samePath()], {
              queryParams: { lang: this.languageService.current_code },
              queryParamsHandling: "merge"
            } );

            observer.next(false);

          }
          break;
        case 'tis-admin':
          switch ( this._getPath(route, 1) ){
            case 'users':
              let query_navigate:boolean = false,
                query_params_to_merge = {};
              const query_params = route.queryParams;

              // lang
              if (typeof query_params.lang !== 'string' || !Lang[query_params.lang.toUpperCase()] ){
                query_params_to_merge['lang'] = this.languageService.current_code;
                query_navigate = true;
              } else {
                const lang: Lang = Lang[query_params.lang.toUpperCase()];
                if( lang !== this.languageService.current_code ){
                  this.languageService.setLanguage(lang);
                }
              }

              // lang
              if (typeof query_params.lang !== 'string' || !Lang[query_params.lang.toUpperCase()] ){
                query_params_to_merge['lang'] = this.languageService.current_code;
                query_navigate = true;
              } else {
                const lang: Lang = Lang[query_params.lang.toUpperCase()];
                if( lang !== this.languageService.current_code ){
                  this.languageService.setLanguage(lang);
                }
              }

              // sort && direction
              if (typeof query_params.sort !== 'string' || !ListUsersSortProperty[query_params.sort.toUpperCase()] ){
                query_params_to_merge['sort'] = 'd';
                query_navigate = true;
              };
              if (typeof query_params.direction !== 'string' || !ListSortDirection[query_params.direction.toUpperCase()] ){
                query_params_to_merge['direction'] = 'd';
                query_navigate = true;
              };

              debugger;
              if( query_navigate ){
                this.router.navigate([this.authService._samePath()], {
                  queryParams: query_params_to_merge,
                  queryParamsHandling: "merge"
                } );
                observer.next(false);
              }else{
                observer.next(true);
              }

              break;
            default:
              const ro = this._getPath(route, 1);
              debugger;
              observer.next(true);
          }

          break;
        default:
          observer.next(false);
      }
      /*this.activatedRoute.queryParams.subscribe(params => {
        if (typeof params.lang !== 'string' || !Lang[params.lang.toUpperCase()] ){
          debugger;
          /!*const currentLang = this.languageService.current_code;
          console.log('currentLang');
          console.log(currentLang);
          debugger;
          this.query_active[query_item] = currentLang as Lang;
          query_navigate = true;*!/
        } else {
          debugger;
          // this.translate.use(query_item_encoded);
        }
        observer.next(true);
      });*/
    })
  }

  private _getPath(route: ActivatedRouteSnapshot, index: number): string {
    return (route.url && route.url[index] && route.url[index].path) ? route.url[index].path : '';
  }

  private _getUrl1(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot | null {
    return (route.children && route.children[0] && route.children[0].children && route.children[0].children[0]) ? route.children[0].children[0] : null;
  }

  logout( message: string ){
    console.log('Auth-Guard :: ' + message)
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}
