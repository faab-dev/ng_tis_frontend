import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LanguageService, DataService } from '../../shared/service';
import { WebSocketService } from "../../shared/service/web-socket.service";
import { WebSocketAction } from "../../shared/interface/web-socket-action";
import {HttpVoidResponse} from "../../shared/interface/http-void-response";
import {FrontRequestSignin} from "../../shared/interface";
import {ComponentStatus} from "../../shared/enum";

@Component({
  selector: 'app-login-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.css']
})
export class LoginPhoneComponent implements OnInit, OnDestroy {
  phoneNumberForm = new FormGroup ({
    phone: new FormControl(''),
  });
  button_timeout: number;
  private timeout: number = 0;
  private timer;
  private component_status: ComponentStatus;
  @Output() emitShowBackButton = new EventEmitter<boolean>();
  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    public translate: TranslateService,
    private ds: DataService,
    private ws: WebSocketService
  ) {}
  ngOnInit() {
    this.component_status = ComponentStatus.INITIALIZED;
    let self = this;
    setTimeout(function () {
      self.ds.sendData({show_back_button: true});
    }, 200);
    // this.ds.sendData({show_back_button: true});
    this.timeout = 0;
    this.actionClearTimer();
    this.translate.use(this.languageService.getCurrentLanguage());
    this.ws.action.subscribe(
      (action: WebSocketAction) => {
        switch (action.code){
          case 200:
            if( this.timeout > 0 ){
              return;
            }
            this.component_status = ComponentStatus.HTTP_PROCESSING;
            console.log('this.phoneNumberForm');
            console.log(this.phoneNumberForm.value.phone);
            console.log(this.phoneNumberForm);
            this.authService.getOtp(this.phoneNumberForm.value.phone)
              .subscribe( (res:HttpVoidResponse) => {
                if( res.error ){
                  this.ws.close();
                  this.component_status = ComponentStatus.INITIALIZED;
                  return;
                }
              });

            this.component_status = ComponentStatus.WS_PROCESSING;
            this.timeout = action.content.timeout;
            this.button_timeout = action.content.timeout;
            this.timer = setTimeout( () => {
              this.actionNextTimer();
            }, 1000);
            break;
          case 202:
            this.actionClearTimer();
            this.component_status = ComponentStatus.HTTP_PROCESSING;
            this.authService.postFrontSignInPhone({
              otp: action.content.otp,
              phone: action.content.phone,
              user_id: this.authService.user_id,
              x_oe_uapp_key: this.authService.x_oe_uapp_key
            } as FrontRequestSignin)
              .subscribe( (res: HttpVoidResponse) => {
                console.log('res');
                console.log(res);
                debugger;
                if( res.error ){
                  this.component_status = ComponentStatus.INITIALIZED;
                  return;
                }
                this.component_status = ComponentStatus.INITIALIZED;
              });
            break;
          case 1013:
            this.actionClearTimer();
            this.component_status = ComponentStatus.WS_OPENING;
            break;
        }
      }
    );
  }

  ngOnDestroy(){
    this.timeout = 0;
    this.actionClearTimer();
  }

  onClickButtonAcceptPhone(): void {
    console.log('onClickButtonAcceptPhone');
    // this.ws.init();
    if( this.isDisabled() ){
      return;
    }

    this.component_status = ComponentStatus.WS_OPENING;
    this.ws.init();


  }

  helperIsValideForm(field: string): boolean {
    return (
      this.phoneNumberForm.controls[field].errors
      && (this.phoneNumberForm.controls[field].dirty || this.phoneNumberForm.controls[field].touched)
    );
  }
  isDisabled(): boolean {
    return (
      this.phoneNumberForm.controls.phone.errors !== null
      || [ComponentStatus.HTTP_PROCESSING, ComponentStatus.WS_OPENING, ComponentStatus.WS_PROCESSING].indexOf(this.component_status) >= 0
    );
  }
  getSubmitTitle(): string {
    if ( this.isDisabled() ) {
      return 'login.submit_disabled';
    }
    return '';
  }
  getSubmitValue(): string {
    if (
      !this.isDisabled()
      || ( this.component_status === ComponentStatus.INITIALIZED && this.phoneNumberForm.controls.phone.errors !== null )
    ) {
      return 'login.accept';
    }

    if( [ComponentStatus.HTTP_PROCESSING, ComponentStatus.WS_OPENING, ComponentStatus.WS_PROCESSING].indexOf(this.component_status) >= 0 ){
      return 'login.' + this.component_status;
    }

    return 'login.accept';
  }
  actionNextTimer(){
    if( this.timer ){
      this.actionClearTimer();
    }

    this.button_timeout -= 1000;
    if( this.timer || this.button_timeout < 1000 ){
      this.actionClearTimer();
    }
    this.timer = setTimeout( () => {
      this.actionNextTimer();
    }, 1000);
  }

  private actionClearTimer(){
    clearTimeout(this.timer);
    this.timer = null;
  }


}
