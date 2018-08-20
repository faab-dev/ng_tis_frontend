import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSortComponent } from './list-sort.component';

describe('ListSortComponent', () => {
  let component: ListSortComponent;
  let fixture: ComponentFixture<ListSortComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSortComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
