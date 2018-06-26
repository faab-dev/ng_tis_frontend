import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

export class PhoneLogin {
  phone: string;
  phone_number: string;
}

@Component({
  selector: 'app-login-phone',
  templateUrl: './login-phone.component.html',
  styleUrls: ['./login-phone.component.css']
})
export class LoginPhoneComponent implements OnInit, AfterViewInit {

  phoneNumber;
  name = 'test';

  phone_login: PhoneLogin = {
    phone: '+7',
    phone_number: '895645123'
  };

  phoneNumberForm = new FormGroup ({
    code: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required)
  });

  @ViewChild('phoneSelect') phoneSelect;

  constructor() {}

  ngOnInit() {
    // this.phoneSelect.setCountry('ru');
  }

  onClickButtonAcceptPhone(): void {
    console.log("onClickButtonAcceptPhone");

    let country_data = this.getCountryData();
    console.log("country_data");
    console.log(country_data);

  }


  setCountry(countryCode) {
    this.phoneSelect.setCountry(countryCode);
  }
  getCountryData() {
    return this.phoneSelect.getCountryData();
  }

  ngAfterViewInit() {
    console.log('Values on ngAfterViewInit():');
    console.log(this.phone_login);

  }

}
