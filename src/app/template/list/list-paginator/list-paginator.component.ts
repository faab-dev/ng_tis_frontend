import { ChangeDetectionStrategy, Component, OnInit, EventEmitter, Input, Output  } from '@angular/core';
import { PaginatorPage } from '../../../shared/interface';


interface ActivePage {
  number?: number;
  text?: string;
  active: boolean;
  icon?: string;
}

@Component({
  selector: 'app-list-paginator',
  templateUrl: './list-paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./list-paginator.component.css']
})
export class ListPaginatorComponent implements OnInit {

  @Input()
  target: string; //Base path where the pagination will redirect to
  pages: ReadonlyArray<ActivePage>;

  constructor(
  ) {
  }

  ngOnInit() {
  }

  @Input()
  set page(page: PaginatorPage) {
    // debugger;
    const first = 1;
    const total_pages = Math.ceil( page.total_elements / page.size );
    const activePage = page.number;
    this.pages = [
      {
        icon: 'left',
        number: activePage === 1 ? null : activePage,
        active: false
      }
    ];
    let pageNumbers: ReadonlyArray<number> = [];
    for (let i = 1; i <= total_pages; i++) {
      // Limit the number of pages
      if (i === first || i === total_pages || activePage === i
        || total_pages < 5
        || activePage - 1 === i || (activePage < 3 && i < 4)
        || activePage + 1 === i || (activePage > total_pages - 2 && i > total_pages - 3)
      ) {
        pageNumbers = [ ...pageNumbers, i ];
      }
    }

    //Transform the pages to a nice output format
    this.pages = pageNumbers.reduce((result: ReadonlyArray<ActivePage>, nextPageNumber: number) => {
      const lastPage = result[ result.length - 1 ].number;
      if (lastPage && lastPage + 1 < nextPageNumber) {
        result = [
          ...result, {
            text: '...',
            active: false,
          }
        ];
      }
      return [
        ...result, {
          number: nextPageNumber,
          active: activePage === nextPageNumber
        }
      ];
    }, this.pages);

    this.pages = [
      ...this.pages, {
        icon: 'right',
        number: activePage === total_pages ? null : activePage + 2,
        active: false
      }
    ];
  }

  @Output() page_emmited = new EventEmitter<PaginatorPage>();

  onClickPage(page: PaginatorPage){
    console.log('onClickPage');

    console.log('page');
    console.log(page);
    this.page_emmited.emit(page);
  }



}
