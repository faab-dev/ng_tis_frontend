import { Component, OnInit } from '@angular/core';

import { Observable } from "rxjs";
import {switchMap, map, first} from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap, NavigationExtras } from "@angular/router";

import {TranslateService} from "@ngx-translate/core";

import { User } from '../../shared/class/'
import { LanguageService, UserService } from "../../shared/service";
import {HttpFullResponse} from "../../shared/interface/http-full-response";
import {ListQuerySort, PaginatorPage} from "../../shared/interface";
import {Lang, ListSortDirection} from "../../shared/enum";
import {ListQuery} from "../../shared/interface/list-query";
import {ListUsersSortProperty} from "../../shared/enum/list-users-sort-property.enum";




@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  $users: Observable<User[]>;
  page:number;
  private disabled: boolean;
  isDisabled(): boolean {
    return this.disabled;
  }

  pageTestShort = { size: 10, total_elements: 30, total_pages: 3, number: 1} as PaginatorPage;
  pageTestFirst = { size: 10,  total_elements: 100,   total_pages: 10, number: 1} as PaginatorPage;
  pageTestSecond = { size: 10,  total_elements: 100,   total_pages: 10, number: 2} as PaginatorPage;
  pageTestMiddle = { size: 10,  total_elements: 100,   total_pages: 10, number: 5} as PaginatorPage;
  pageTestLast1 = { size: 10,  total_elements: 100,   total_pages: 10, number: 9} as PaginatorPage;
  pageTestLast = { size: 10,  total_elements: 100,   total_pages: 10, number: 10} as PaginatorPage;

  page_paginator: PaginatorPage = { size: 10,  total_elements: 0,  number: 1};

  private path_list = 'tis-admin/users';
  private query_active:ListQuery;
  query_users_list_sort_property = ListUsersSortProperty;

  constructor(
    private modelService: UserService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.disabled = true;
    this.route.queryParams.subscribe(params => {
      this.query_active = {
        lang: ( typeof params.lang === 'string' && Lang[params.lang.toUpperCase()] ) ? Lang[params.lang.toUpperCase()] : Lang.RU,
        sort: ( typeof params.sort === 'string' && ListUsersSortProperty[params.sort.toUpperCase()] ) ? ListUsersSortProperty[params.sort.toUpperCase()] : ListUsersSortProperty.D,
        direction: ( typeof params.direction === 'string' && ListSortDirection[params.direction.toUpperCase()] ) ? ListSortDirection[params.direction.toUpperCase()] : ListSortDirection.D
      }
    })

    /*this.route.queryParams.subscribe(params => {
      for ( let i = 0; i < query_params_allowed_length; i++ ) {
        const query_item = this.query_params_allowed[i],
          query_item_encoded = params[query_item];
        switch (query_item) {
          case 'lang':
            debugger;
            if (typeof query_item_encoded !== 'string' || !Lang[query_item_encoded.toUpperCase()] ){
              const currentLang = this.languageService.current_code;
              console.log('currentLang');
              console.log(currentLang);
              debugger;
              this.query_active[query_item] = currentLang as Lang;
              query_navigate = true;
            } else {
              this.translate.use(query_item_encoded);
            }
            break;
          case 'sort':
            const query_sort_direction_encoded = params['direction'];
            if (!query_item_encoded || !query_sort_direction_encoded) {
              query_navigate = true;
            } else {
              this.query_active[query_item] = query_item_encoded;
              this.query_active.direction = query_sort_direction_encoded as ListSortDirection;
            }
            break;
          case 'filter':
            if (!query_item_encoded) {
              query_navigate = true;
            } else {
              const query_item_decoded = JSON.parse(decodeURI(query_item_encoded));
              if (!query_item_decoded) {
                query_navigate = true;
              } else {
                this.query_active[query_item] = query_item_decoded as ListQuerySort;
              }
            }
            break;
        }
      }

      if( query_navigate ){
        this._navigate();
      }
    });*/

    this.$users = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => /*this.modelService.getUsers( this.page = parseInt(params.get('page')) )*/{
        console.log('params');
        console.log(params);
        const page_string = params.get('page');
        console.log('page_string');
        console.log(page_string);
        const page = parseInt(page_string);
        console.log('page');
        console.log(page);

        if( isNaN(page) || page <= 0 ){
          this.page_paginator.number = 1;
          debugger;
          this._navigate();
        }

        this.page_paginator.number = page;

         return this.modelService.getUsers( this.page_paginator, this.query_active )
           .pipe(
             map(
               (http_full_response: HttpFullResponse) => {
                 console.log('ngOnInit paramMap pipe map');
                 console.log('http_full_response.body');
                 console.log(http_full_response.body);
                 this.disabled = false;
                 this.pageTestFirst.total_elements = http_full_response.count;
                 return http_full_response.body;
               }
             )
           );
        }
      )
    )
  }

  onPage(page: PaginatorPage) {
    if( this.isDisabled() ){
      return;
    }
    this.disabled = true;
    this.page_paginator.number = page.number;
    debugger;
    this._navigate();
  }

  onSort(list_query_sort: ListQuerySort){
    if( this.isDisabled() ){
      return;
    }
    this.disabled = true;
    this.query_active.sort = list_query_sort.sort;
    this.query_active.direction = list_query_sort.direction;
    this.page_paginator.number = 1;
    debugger;
    this._navigate();
  }

  _getQueryActive(): ListQuery {
    return {
      lang: this.query_active.lang,
      sort: this.query_active.sort,
      direction: this.query_active.direction,
      // filter: encodeURI(JSON.stringify(this.query_active.sort))
    }
  }

  private _navigate(): void {
    console.log('this.page_paginator');
    console.log(this.page_paginator);
    this.router.navigate(['/'+this.path_list+'/'+this.page_paginator.number, this._getQueryActive()])
  }

}
