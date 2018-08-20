import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ListQuerySort} from "../../../shared/interface/list-query-sort";
import {PaginatorPage} from "../../../shared/interface";
import {ListSortDirection} from "../../../shared/enum";
import {ListUsersSortProperty} from "../../../shared/enum/list-users-sort-property.enum";

@Component({
  selector: 'app-list-sort',
  templateUrl: './list-sort.component.html',
  styleUrls: ['./list-sort.component.css']
})
export class ListSortComponent implements OnInit {

  @Input()
  list_attribute:ListUsersSortProperty;
  @Input()
  query_active_sort:ListQuerySort;
  constructor() { }

  ngOnInit() {
  }

  @Output() sort_emmited = new EventEmitter<ListQuerySort>();

  onClickSort(){
    console.log('onClickSort');

    if( this.query_active_sort.sort === this.list_attribute ){
      this.query_active_sort.direction = (this.query_active_sort.direction === ListSortDirection.D ) ? ListSortDirection.A : ListSortDirection.D;
    }else{
      this.query_active_sort.sort = this.list_attribute;
      this.query_active_sort.direction = ListSortDirection.A;
    }

    this.sort_emmited.emit(this.query_active_sort);
  }

  isActive(): boolean {
    return ( this.list_attribute === this.query_active_sort.sort ) ? true : false;
  }


  currentSrc(): string {
    return ( this.isActive() ) ? ( this.query_active_sort.direction === ListSortDirection.D ) ? '/assets/images/template/list/list-sort/ic_arrow_down.svg' : '/assets/images/template/list/list-sort/ic_arrow_up.svg'
      : '/assets/images/template/list/list-sort/ic_filter_sort_select.svg';
  }

}
