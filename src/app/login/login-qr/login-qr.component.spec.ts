import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginQRComponent } from './login-qr.component';

describe('LoginQRComponent', () => {
  let component: LoginQRComponent;
  let fixture: ComponentFixture<LoginQRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginQRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginQRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
