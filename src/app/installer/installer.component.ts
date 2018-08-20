import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-installer',
  templateUrl: './installer.component.html',
  styleUrls: ['./installer.component.css']
})
export class InstallerComponent implements OnInit {

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
    // this.translate.use('ru');
  }

}
