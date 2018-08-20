import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError as observableThrowError } from 'rxjs';
import {tap, finalize, first, switchMap, take, filter, catchError } from 'rxjs/operators';
import { AuthService} from '../service';


@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {

  isRefreshingToken: boolean = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(public auth: AuthService) {}

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    token = token;
    return req.clone({ setHeaders: { Authorization: token }})
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('RefreshTokenInterceptor');


    return next
      .handle(request)
      .pipe(
        catchError(
          error => {

            if (error instanceof HttpErrorResponse) {
              switch ((<HttpErrorResponse>error).status) {
                case 403:
                  return this.handle403Error(request, next);
                default:
                  return observableThrowError(error);
              }
            } else {
              return observableThrowError(error);
            }

          }
        )
      );
  }

  handle403Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);

      // const authService = this.injector.get(AuthService);

      return this.auth.postFrontTokenRefresh().pipe(
        switchMap((newToken: string) => {
          if (newToken) {
            this.tokenSubject.next(newToken);
            return next.handle(this.addToken(req, newToken));
          }

          // If we don't get a new token, we are in trouble so logout.
          return this.logoutUser();
        }),
        catchError(error => {
          // If there is an exception calling 'refreshToken', bad news so logout.
          return this.logoutUser();
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        }),);
    } else {
      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(req, token));
        }),);
    }
  }

  logoutUser() {
    this.auth.logout()
    return observableThrowError("");
  }

}
