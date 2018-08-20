import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }

  public getCookie(name: string) {
    const ca: Array<string> = document.cookie.split(';'),
      caLen: number = ca.length,
      cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) === 0) {
        return decodeURI( c.substring(cookieName.length, c.length).toString().trim() );
      }
    }
    return '';
  }

  public deleteCookie(name) {
    this.setCookie(name, '', -1);
  }

  public setCookie(name: string, value: string|object, expireDays: number = 0, path: string = '') {
    if ( typeof value === 'object' ) {
      value = JSON.stringify(value);
    }
    value = encodeURI( String(value) );
    let expires: string = '';
    if ( expireDays === 0 ) {
      expireDays = 30;
      const d: Date = new Date();
      d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
      expires = 'expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + value + '; ' + expires + '; path=/;';
  }
  private helperCookieRead(cookie_name: string): string {
    const cookie_name_eq = cookie_name + '=',
      cookies = document.cookie.split(';'),
      cookies_length = cookies.length;
    for ( let i = 0; i < cookies_length; i++ ) {
      let cookie = cookies[i];
      /*while ( cookie.charAt(0) === ' ' ) {
        cookie = cookie.substring( 1, cookie.length );
      }*/
      cookie = cookie.toString().trim();
      if ( cookie.indexOf(cookie_name_eq) === 0 ) {
        return decodeURIComponent( cookie.substring( cookie_name_eq.length, cookie.length));
      }
    }
    return '';
  }

}
