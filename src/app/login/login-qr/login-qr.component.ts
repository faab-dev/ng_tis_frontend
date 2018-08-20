import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DataService} from '../../shared/service';

@Component({
  selector: 'app-login-qr',
  templateUrl: './login-qr.component.html',
  styleUrls: ['./login-qr.component.css']
})
export class LoginQRComponent implements OnInit {
  constructor(
    private ds: DataService
  ) { }

  ngOnInit() {
    let self = this;
    setTimeout(function () {
      self.ds.sendData({show_back_button: true});
    }, 200);
    // this.ds.sendData({show_back_button: true});
  }

}
