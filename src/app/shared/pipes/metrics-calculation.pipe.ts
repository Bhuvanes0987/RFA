import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metricsCalculation',
  standalone: true,
})
export class MetricsCalculationPipe implements PipeTransform {
  transform(startDate: Date | string, endDate: Date | string): number {
    // Convert strings to Date objects if necessary
    if (typeof startDate === 'string') {
      startDate = new Date(startDate);
    }
    if (typeof endDate === 'string') {
      endDate = new Date(endDate);
    }

    let businessDaysCount = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // 0 is Sunday, 6 is Saturday
        businessDaysCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(businessDaysCount, 'businessDaysCount');

    return businessDaysCount;
  }

  onTimeDeliveryTransform(
    status: string,
    plannedEndDate: Date | string,
    actualEndDate: Date | string
  ): string {
    console.log(status, plannedEndDate, actualEndDate, 'onnTimeDelivery');

    if (status !== 'Completed') {
      return 'No';
    }

    if (typeof plannedEndDate === 'string') {
      plannedEndDate = new Date(plannedEndDate);
    }
    if (typeof actualEndDate === 'string') {
      actualEndDate = new Date(actualEndDate);
    }

    if (actualEndDate && plannedEndDate) {
      if (actualEndDate <= plannedEndDate) {
        return 'Yes';
      } else {
        return 'No';
      }
    }

    return 'N0';
  }

  taskToBeCompletedThisMonth(
    actualEndDate: Date | string,
    status: string,
    expectedCompletionMonth: number
  ): string {
    let actualEndDateObj: Date | null = null;

    if (typeof actualEndDate === 'string' && actualEndDate !== '') {
      actualEndDateObj = new Date(actualEndDate);
    }

    const actualMonth = actualEndDateObj
      ? actualEndDateObj.getMonth() + 1
      : null;

    let taskCompletionStatus = '';

    // if (!actualEndDateObj && status === 'In Progress') {
    //   taskCompletionStatus = 'Yes';
    // } else if (actualMonth !== null && actualMonth > expectedCompletionMonth) {
    //   taskCompletionStatus = 'No';
    // } else if (status === 'In Progress' || status === 'Completed') {
    //   taskCompletionStatus = 'Yes';
    // }
    if (status === 'In Progress') {
      taskCompletionStatus = 'Yes';
    } else if (actualMonth !== null && actualMonth > expectedCompletionMonth) {
      taskCompletionStatus = 'No';
    } else if (status === 'In Progress' || status === 'Completed') {
      taskCompletionStatus = 'Yes';
    }

    // Set the calculated task completion status in the form control
    // this.developmentTickets.controls[idx].get('taskToBeCompletedThisMonth')?.setValue(taskCompletionStatus);
    return taskCompletionStatus;
  }
}
