import { Injectable } from '@angular/core';
import {ActivatedRoute, Router, Params, RouterState} from '@angular/router';
import { Location } from '@angular/common';
import { Language} from '../interface/language';
import { TranslateService } from '@ngx-translate/core';
import {Lang} from "../enum";
import {Observable} from "rxjs/internal/Observable";


@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  languages: Language[] = [
    {code: Lang.RU, title: 'Русский'},
    {code: Lang.EN, title: 'English'},
  ];
  current_code: Lang = Lang.RU;
  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location
  ) {
    const path = this.route.queryParams.subscribe(params => {
      console.log(params); // {order: "popular"}

      let code = ( params && params.lang ) ? params.lang : '';
      if ( code !== this.current_code ) {
        if ( !this.isAllowableLanguage(code) ) {
          code = this.current_code;
        }
        this.setLanguage( code );

      }
    });
  }

  getCurrentLanguage(): string {
    return this.current_code;
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  setLanguage(code: Lang, do_not_check_query?: boolean): void {
    console.log('LanguageService::setLanguage');
    if ( !code || this.current_code === code ) {
      return;
    }
    const languages = this.getLanguages(),
      languages_length = languages.length;
    for (let i = 0; i < languages_length; i++) {
      const language = languages[i];

      if ( !language.code || language.code !== code ) {
        continue;
      }
      this.current_code = code;
      this.translate.use(code);


      /*this.route.queryParams.subscribe(params => {
        if( typeof params.lang === 'string' && Lang[params.lang.toUpperCase()] === code ){
          return;
        }
        debugger;
        this.router.navigate([this._samePath()], {
          queryParams: { lang: code },
          queryParamsHandling: "merge"
        } )
      });*/


      /*const query_params: Params = Object.assign({}, this.route.snapshot.queryParams);
      // Do something with the params
      query_params['lang'] = code;

      this.router.navigate([], { relativeTo: this.route, queryParams: query_params } );
      break;*/
    }
  }

  isCurrentLanguage(code: string): boolean {
    return (this.current_code === code ) ? true : false;
  }

  private _samePath(): string {
    return this._location.path().split('?')[0].split('#')[0];
  }

  isAllowableLanguage(code: string): boolean {
    const languages = this.getLanguages(),
      languages_length = languages.length;
    for (let i = 0; i < languages_length; i++) {
      const language = languages[i];
      if ( !language.code || language.code !== code ) {
        continue;
      }
      return true;
    }
    return false;
  }
}
