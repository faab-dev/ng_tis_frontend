import { Component, OnInit, OnChanges, SimpleChange, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../shared/service';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.css']
})
export class FormErrorComponent implements OnInit, OnChanges {
  errors_modified: any[];
  @Input() errors: object;
  @Input() display_error: boolean;
  constructor(
    private languageService: LanguageService,
    public translate: TranslateService
  ) {
  }
  /*ngOnInit() {
    console.log('FormErrorComponent ngOnInit');
    debugger;

    const lang = this.languageService.getCurrentLanguage();
    console.log('lang');
    console.log(lang);
    this.translate.use(this.languageService.getCurrentLanguage());

    // Step 1. Get all the object keys.
    const errors_properties = Object.keys(this.errors);
    console.log('errors_properties');
    console.log(errors_properties);
    this.errors_modified = [];
// Step 3. Iterate throw all keys.
    for (const prop of errors_properties) {
      /!*console.log('prop');
      console.log(prop);
      console.log('this.errors[prop]');
      console.log(this.errors[prop]);*!/
      this.errors_modified.push(this.actionGetMessagesByErrorProperty(prop, this.errors[prop]));
    }
  }*/

  ngOnInit() {}

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    for ( const propName in changes ) {
      const changedProp = changes[propName];
      if ( propName === 'errors' ) {
        let to: object = {};
        if ( changedProp && typeof changedProp.currentValue === 'object' ) {
          to = changedProp.currentValue;
        }
        this.errors_modified = [];
        if ( to ) {
          for (const errProp in to ) {
            const err = this.actionGetMessagesByErrorProperty( errProp, to[errProp] );
            if ( err ) {
              this.errors_modified.push(err);
            }
          }
        }
      }
    }
  }

  private actionGetMessagesByErrorProperty(error_key: string, error_value: boolean|string|number|object ): string {
    // debugger;
    if (
      [
        'required',
        'user_not_found',
        'default',
        'libphonenumber_country_are_not_selected',
        'libphonenumber_country_is_not_valid',
        'libphonenumber_phonenumber_is_not_mobile',
        'libphonenumber_phonenumber_is_not_valid'
      ].indexOf(error_key) >= 0
      && error_value === true
    ) {
      return error_key;
    }
    if ( error_key === 'minlength' && typeof error_value['requiredLength'] === 'number' ) {
      return 'min_length_0' + String(error_value['requiredLength']);
    }
  }

}
