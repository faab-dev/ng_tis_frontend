import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {AuthService, DataService, LanguageService} from '../../shared/service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  formErrors: object = {};
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
    this.translate.use(this.languageService.getCurrentLanguage());
    let self = this;
    setTimeout(function () {
      self.ds.sendData({show_back_button: true});
    }, 200);
    /*this.loginForm = this.fb.group({
      login: new FormControl(this.login, [Validators.required,  Validators.minLength(2)]),
      password: new FormControl(this.password, [Validators.required,  Validators.minLength(2)]),
      // ['', Validators.required]
    });*/

    // reset login status
    // this.authenticationService.logout();

    // get return url from activatedRoute parameters or default to '/'

    this.loginForm = this.fb.group({
      login: ['', [Validators.required,  Validators.minLength(2)] ],
      password: ['', [Validators.required,  Validators.minLength(2)] ]
    });
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }

  onClickAcceptForm(): void {
    console.log('onClickAcceptForm');
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
    if ( this.loginForm.status === 'VALID' ){
      this.actionSignin();
    }
  }
  actionSignin(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.postSignIn(
      {
        login: this.f.login.value,
        password: this.f.password.value,
        x_oe_uapp_key: this.authService.x_oe_uapp_key
      }
  )
      .pipe(first())
      .subscribe(
        sign_in_error => {
          this.formErrors = {};
          if (  !sign_in_error || sign_in_error.error ) {
            this.loading = false;
            return;
          }
          this.authService.getUserWithBrowserData()
            .pipe(first())
            .subscribe(
              user => {
                console.log('user');
                console.log(user);
                this.loading = false;
                // this.router.navigate([this.returnUrl]);
              },
              error => {
                console.log('error');
                console.log(error);
                this.loading = false;
              }
            );
        },
        error => {
          console.log("http://77.244.218.222:8081/");
          console.log(error);
          switch ( error.status ) {
            case 404:
              this.formErrors = {'user_not_found': true};
              break;
            default:
              this.formErrors = {'default': true};
          }
          this.loading = false;
        });
  }
  /*createForm() {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required,  Validators.minLength(2)] ],
      password: ['', Validators.required, [Validators.required,  Validators.minLength(2)] ]
    });
  }*/
  helperIsValideForm(field: string): boolean {
    return (this.loginForm.controls[field].errors && (this.loginForm.controls[field].dirty || this.loginForm.controls[field].touched));
  }

  helperGetErrors(field: string): object {
    const error = this.loginForm.controls[field].errors;
    // debugger;
    return (this.loginForm.controls[field].errors);
  }

}
