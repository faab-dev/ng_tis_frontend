import { Component, OnInit } from '@angular/core';
import { Language } from '../shared/interface/language';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  languages: Language[];
  language_active: string;
  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.languages = environment.languages;
    this.language_active = environment.language_default_code;
  }

  onClickLanguage(language_code: string): void {
    console.log('onClickLanguage');
    console.log('language_code');
    console.log(language_code);
    this.language_active = language_code;
    this.translate.use(language_code);
  }

}
