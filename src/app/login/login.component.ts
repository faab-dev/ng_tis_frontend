import { Component, OnInit } from '@angular/core';
import { Language } from '../shared/interface/language';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService} from '../shared/service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  languages: Language[];
  language_active: string;
  constructor(
    public translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.languages = this.languageService.getLanguages();
    this.language_active = this.languageService.current_code;
    /*this.languages = environment.languages;
    this.language_active = environment.language_default_code;*/
  }

  onClickLanguage(language_code: string): void {
    console.log('onClickLanguage');
    if ( language_code === this.language_active) {
      return;
    }
    this.language_active = language_code
    this.languageService.setLanguage(language_code);
  }

}
