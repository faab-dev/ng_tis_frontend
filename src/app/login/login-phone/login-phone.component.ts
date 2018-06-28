import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LanguageService, DataService } from '../../shared/service';

@Component({
  selector: 'app-login-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.css']
})
export class LoginPhoneComponent implements OnInit {
  phoneNumberForm = new FormGroup ({
    phone: new FormControl(''),
  });
  @Output() emitShowBackButton = new EventEmitter<boolean>();
  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    public translate: TranslateService,
    private ds: DataService
  ) {}
  ngOnInit() {
    /*debugger;*/
    let self = this;
    setTimeout(function () {
      self.ds.sendData({show_back_button: true});
    }, 200);
    // this.ds.sendData({show_back_button: true});
    this.translate.use(this.languageService.getCurrentLanguage());
  }

  onClickButtonAcceptPhone(): void {
    console.log('onClickButtonAcceptPhone');
  }

  helperIsValideForm(field: string): boolean {
    return (
      this.phoneNumberForm.controls[field].errors
      && (this.phoneNumberForm.controls[field].dirty || this.phoneNumberForm.controls[field].touched)
    );
  }
  isDisabled(): boolean {
    return ( this.phoneNumberForm.controls.phone.errors === null ) ? false : true;
  }
  getSubmitTitle(): string {
    if ( this.isDisabled() ) {
      return 'login.submit_disabled';
    }
    return '';
  }


}
