import {ListSortDirection, ListUsersSortProperty} from "../enum";

export interface ListQuerySort{
  sort: ListUsersSortProperty;
  direction: ListSortDirection;
}
