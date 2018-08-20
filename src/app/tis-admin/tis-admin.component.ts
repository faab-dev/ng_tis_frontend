import { Component, OnInit } from '@angular/core';
import {LanguageService} from "../shared/service";
import {ActivatedRoute} from "@angular/router";
import {Language} from "../shared/interface/language";
import {Lang} from "../shared/enum";

@Component({
  selector: 'app-tis-admin',
  templateUrl: './tis-admin.component.html',
  styleUrls: ['./tis-admin.component.css']
})
export class TisAdminComponent implements OnInit {

  languages: Language[];
  language_active: Lang;
  constructor(
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.languages = this.languageService.getLanguages();
    this.language_active = this.languageService.current_code;
  }

  onClickLanguage(language_code: Lang): void {
    console.log('onClickLanguage');
    if ( language_code === this.language_active) {
      return;
    }
    this.language_active = language_code
    this.languageService.setLanguage(language_code);
  }

}
