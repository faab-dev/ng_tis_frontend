import { Component, OnInit, OnDestroy } from '@angular/core';
import { Language } from '../shared/interface/language';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {LanguageService, DataService, AuthService} from '../shared/service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {Lang} from "../shared/enum";
import {Observable} from "rxjs/internal/Observable";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  show_back_button: boolean = true;
  languages: Language[];
  subscription: Subscription;

  constructor(
    public translate: TranslateService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ds: DataService,
    private authService: AuthService
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
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  onClickBackButton(): void {
    const query_params: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.router.navigate(['/login'], { queryParams: query_params } );
  }
  _samePath():string {
    return this.authService._samePath();
  }



}
