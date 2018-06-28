import { Component, OnInit, OnDestroy } from '@angular/core';
import { Language } from '../shared/interface/language';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService, DataService } from '../shared/service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  show_back_button: boolean = true;
  languages: Language[];
  language_active: string;
  subscription: Subscription;

  constructor(
    public translate: TranslateService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ds: DataService
  ) {
    this.subscription = this.ds.getData().subscribe(
      x => {
        if ( x && typeof x.show_back_button === 'boolean' ) {
          this.show_back_button = x.show_back_button;
        }
      }
    );
  }

  ngOnInit() {
    this.languages = this.languageService.getLanguages();
    this.language_active = this.languageService.current_code;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  onClickLanguage(language_code: string): void {
    console.log('onClickLanguage');
    if ( language_code === this.language_active) {
      return;
    }
    this.language_active = language_code
    this.languageService.setLanguage(language_code);
  }
  onClickBackButton(): void {
    const query_params: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.router.navigate(['/login'], { queryParams: query_params } );
  }



}
