import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TisAdminComponent } from './tis-admin.component';

describe('TisAdminComponent', () => {
  let component: TisAdminComponent;
  let fixture: ComponentFixture<TisAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TisAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TisAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
