import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Language} from '../interface/language';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  languages: Language[] = [
    {code: 'ru', title: 'Русский'},
    {code: 'en', title: 'English'},
  ];
  current_code: string = 'ru';
  private locationService: Location;
  constructor(
    private translate: TranslateService,
    locationService: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.locationService = locationService;
    const path = this.activatedRoute.queryParams.subscribe(params => {
      console.log(params); // {order: "popular"}

      let code = ( params && params.lang ) ? params.lang : '';
      if ( code !== this.current_code ) {
        if ( !this.isAllowableLanguage(code) ) {
          code = this.current_code;
        }
        this.setLanguage( code );

      }


      // const user = route.data.map(d => d.user);
    });
  }

  getCurrentLanguage(): string {
    return this.current_code;
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  setLanguage(code: string): void {
    console.log('LanguageService::setLanguage');
    if ( !code ) {
      return;
    }
    const languages = this.getLanguages(),
      languages_length = languages.length;
    for (let i = 0; i < languages_length; i++) {
      const language = languages[i];
      if ( !language.code ) {
        continue;
      }
      this.current_code = code;
      this.translate.use(code);
      const query_params: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);

      // Do something with the params
      query_params['lang'] = code;

      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: query_params } );
      break;
    }
  }

  isCurrentLanguage(code: string): boolean {
    return (this.current_code === code ) ? true : false;
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
