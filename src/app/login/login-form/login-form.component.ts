import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, Validators, FormControl, ValidationErrors} from '@angular/forms';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {AuthService, DataService, LanguageService} from '../../shared/service';
import {ComponentStatus, LoginErrors} from "../../shared/enum";
import {HttpVoidResponse, FrontRequestSignin} from "../../shared/interface";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  formErrors: object = {};
  private component_status: ComponentStatus;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    // private authenticationService: AuthenticationService,
    private authService: AuthService,
    private languageService: LanguageService,
    public translate: TranslateService,
    private ds: DataService
  ) {}

  ngOnInit() {
    this.component_status = ComponentStatus.INITIALIZED;
    this.translate.use(this.languageService.getCurrentLanguage());
    setTimeout(() => {
      this.ds.sendData({show_back_button: true});
    }, 200);

    this.loginForm = this.fb.group({
      login: ['', [Validators.required,  Validators.minLength(2)] ],
      password: ['', [Validators.required,  Validators.minLength(2)] ]
    });
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }

  onClickAcceptForm(): void {
    console.log('onClickAcceptForm');
    console.log('this.loginForm.status');
    console.log(this.loginForm.status);
    if ( this.loginForm.status === 'VALID' ){
      this.actionSignin();
    } else {
      Object.keys(this.loginForm.controls).forEach(field => { // {1}
        const control = this.loginForm.get(field);
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({onlySelf: true});// {3}
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
  onSubmit() {
    this.actionSignin();
  }
  actionSignin(): void {
    if( this.isDisabled() ){
      return;
    }

    this.component_status = ComponentStatus.HTTP_PROCESSING;
    this.authService.postFrontSignInForm(
      {
        login: this.f.login.value,
        password: this.f.password.value,
        x_oe_uapp_key: this.authService.x_oe_uapp_key
      } as FrontRequestSignin
  )
      .pipe(first())
      .subscribe(
        (http_void_response: HttpVoidResponse) => {
          this.formErrors = {};
          if (  !http_void_response || http_void_response.error ) {
            this.component_status = ComponentStatus.INITIALIZED;
            return;
          }
          this.authService.getUserWithBrowserData()
            .pipe(first())
            .subscribe(
              (res: HttpVoidResponse) => {
                if (  !res || res.error ) {
                  this.component_status = ComponentStatus.INITIALIZED;
                  return;
                }
                this.router.navigate(['/'+this.authService.path_default]);
                this.component_status = ComponentStatus.INITIALIZED;
              },
              error => {
                console.log('error');
                console.log(error);
                console.log(typeof error);
                this.component_status = ComponentStatus.INITIALIZED;

                if (Object.values(LoginErrors).includes(error.message)) {
                  let err = {} as ValidationErrors;
                  err[error.message] = true;
                  this.formErrors = err;
                }


              }
            );
        },
        error => {
          this.component_status = ComponentStatus.INITIALIZED;
          let err = {} as ValidationErrors;

          if ( error.message && Object.values(LoginErrors).includes(error.message)) {
            err[error.message] = true;
            this.formErrors = err;
            return;
          }

          switch ( error.status ) {
            case 404:
              err[LoginErrors.USER_NOT_FOUND] = true;
              break;
            default:
              err[LoginErrors.DEFAULT] = true;
          }
          this.formErrors = err;
        });
  }

  isDisabled(): boolean {
    return (
      this.loginForm.status !== 'VALID'
      || [ComponentStatus.HTTP_PROCESSING].indexOf(this.component_status) >= 0
    );
  }
  isLoading(): boolean {
    return (
      [ComponentStatus.HTTP_PROCESSING].indexOf(this.component_status) >= 0
    );
  }

  helperIsValideForm(field: string): boolean {
    return (this.loginForm.controls[field].errors && (this.loginForm.controls[field].dirty || this.loginForm.controls[field].touched));
  }

  helperGetErrors(field: string): object {
    const error = this.loginForm.controls[field].errors;
    // debugger;
    return (this.loginForm.controls[field].errors);
  }

}
