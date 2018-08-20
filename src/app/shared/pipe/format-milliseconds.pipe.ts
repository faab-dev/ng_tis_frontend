import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

@Pipe({
  name: 'formatMilliseconds'
})
export class FormatMillisecondsPipe implements PipeTransform {

  constructor(
    private translate: TranslateService,
  ){

  }

  transform(value: number, args?: any): string {

    if( isNaN(value) ){
      return ''
    }
    const seconds_total = Math.round( value / 1000);
    if( seconds_total <= 0 ){
      return '';
    }

    let seconds = 0,
      minutes = 0,
      hours = 0,
      formatted_milliseconds = '';

    if( seconds_total > 59 ){
      minutes = ~~(seconds_total/60);
      seconds = seconds_total - (minutes * 60);
      if( minutes > 59 ){
        hours = ~~(minutes/60);
        minutes = minutes - (hours * 60);
      }
    }else{
      seconds = seconds_total;
    }

    if( hours > 0 ){
      formatted_milliseconds += hours + this.translate.instant('login.h') + ' ';
    }
    if( minutes > 0 ){
      formatted_milliseconds += minutes + this.translate.instant('login.m') + ' ';
    }
    if( seconds > 0 ){
      formatted_milliseconds += seconds + this.translate.instant('login.s') + ' ';
    }
    return formatted_milliseconds;
  }

}
