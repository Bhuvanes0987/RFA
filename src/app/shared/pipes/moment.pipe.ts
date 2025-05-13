import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
 
@Pipe({
  name: 'momentFormat',
  standalone: true,
})
export class MomentFormatPipe implements PipeTransform {
  transform(value: string, format: string): string {
    if (!value || !format) return '';
    return moment(value).format(format);
  }
}