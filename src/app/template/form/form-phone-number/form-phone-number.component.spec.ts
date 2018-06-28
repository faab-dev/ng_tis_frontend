import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPhoneNumberComponent } from './form-phone-number.component';

describe('FormPhoneNumberComponent', () => {
  let component: FormPhoneNumberComponent;
  let fixture: ComponentFixture<FormPhoneNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormPhoneNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPhoneNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
