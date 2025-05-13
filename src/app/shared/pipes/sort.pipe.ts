import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: true
})
export class SortPipe implements PipeTransform {

  transform(value: any[], args?: any): any[] {
    if (!value || !Array.isArray(value)) {
      return value;
    }

    const sortField = args;
    return value.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return -1;
      } else if (a[sortField] > b[sortField]) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
