import { Injectable } from '@angular/core';
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
  constructor(
    private translate: TranslateService
  ) {}

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
      break;
    }
  }

  isCurrentLanguage(code: string): boolean {
    return (this.current_code === code ) ? true : false;
  }
}
