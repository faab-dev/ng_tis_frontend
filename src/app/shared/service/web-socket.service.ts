import { Injectable } from '@angular/core';
import { Observable  } from 'rxjs';
import { AuthService } from "./auth.service";
import { WebSocketAction } from "../interface/web-socket-action";
import { Subject } from 'rxjs';
import { WebSocketStatus } from "../enum/web-socket-status.enum";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private ws: WebSocket;
  private url_ws_auth = 'auth/socket';
  action = new Subject<WebSocketAction>();
  constructor(
    private authService: AuthService
  ) { }

  init(): void {
    this.ws = new WebSocket(this._helperHttpUrlToWebSockeUrl(this.authService.url_ars_be) + '/' + this.url_ws_auth );

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  close(): void {
    if( !this.ws ){
      return;
    }
    this.ws.close(1000);
  }

  private onOpen(event: Event){
    console.log('onOpen');

    console.log('event');
    console.log(event);

    console.log('this.ws');
    console.log(this.ws);

    if( !this.ws || this.ws.readyState !== WebSocketStatus.OPEN  || event.type !== 'open' ){
      return;
    }

    console.log('this.authService.x_oe_uapp_key');
    console.log(this.authService.x_oe_uapp_key);

    this.ws.send(JSON.stringify({Authorization: this.authService.x_oe_uapp_key} ));
  }

  private onMessage(event: MessageEvent){
    console.log('onMessage');

    console.log('event');
    console.log(event);

    if( !event || typeof event.data !== 'string' ){
      return;
    }

    const response = JSON.parse(event.data);

    if( !response ){
      return;
    }

    switch ( response.result ){
      case 200:
        if( typeof response.timeout !== 'number' ){
          return;
        }
        this.action.next({
          code: 200,
          content: {
            timeout:response.timeout
          }
        } as WebSocketAction);
        break;
      case 202:
        if( typeof response.otp !== 'string' || typeof response.number !== 'string' ){
          return;
        }
        this.action.next({
          code: 200,
          content: {
            otp: response.otp,
            phone: response.number
          }
        } as WebSocketAction);
        break;
    }

  }

  private onError(event){
    console.log('onError');

    console.log('event');
    console.log(event);
  }

  private onClose(event: CloseEvent){
    console.log('onClose');

    console.log('event');
    console.log(event);

    if( !event || event.code === 1000 ){
      return;
    }

    if( event.code == 1006 ){
      this.init();
    }

    this.action.next({
      code: 1013,
      content: {
        no_connection: true
      }
    } as WebSocketAction);
  }

  private _helperHttpUrlToWebSockeUrl(url: string) {
    const fn_name = 'helperHttpUrlToWebSockeUrl';
    console.log('fn_name: '+fn_name);
    return url.replace(/(http)(s)?\:\/\//, "ws$2://");
  }
}
