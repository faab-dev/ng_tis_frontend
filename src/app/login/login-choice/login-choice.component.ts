import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService, LanguageService } from '../../shared/service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-choice',
  templateUrl: './login-choice.component.html',
  styleUrls: ['./login-choice.component.css']
})
export class LoginChoiceComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ds: DataService
  ) { }

  ngOnInit() {
    this.translate.use(this.languageService.getCurrentLanguage());
    let self = this;
    setTimeout(function () {
      self.ds.sendData({show_back_button: false});
    }, 200);
    // this.ds.sendData({show_back_button: false});
  }
  onClickPhone(): void {
    const query_params: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.router.navigate(['/login/phone'], { queryParams: query_params } );
  }
  onClickQR(): void {
    const query_params: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    this.router.navigate(['/login/qr'], { queryParams: query_params } );
  }

}
