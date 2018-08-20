import { Component, OnInit, Directive, Input, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Directive({
  selector: '[appValidateFormOnBlur]'
})
export class ValidateFormOnBlurDirective {
  @Input('validateFormControl') validateFormControl;
  constructor() { }
  @HostListener('focus', ['$event.target'])
  onFocus(target) {
    console.log('Focus called');
    //this.validateFormControl.markAsUntouched();
    //console.log(this.validateFormControl.touched);
  }
  @HostListener('focusout', ['$event.target'])
  onFocusout(target) {
    console.log('Focus out called');
    // this.validateFormControl.markAsTouched();
  }

}
