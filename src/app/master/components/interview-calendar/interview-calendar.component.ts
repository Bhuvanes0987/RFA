/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

import { DropdownModule } from 'primeng/dropdown';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';

interface Candidate {
  name: string;
  email: string;
  mobile: string;
  datetime: string;
  status: string;
}

interface InterviewEvent {
  title: string;
  date: string;       // ISO yyyy-MM-dd
  color?: string;
  candidates: Candidate[];
}

@Component({
  selector: 'app-interview-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, FullCalendarModule],
  templateUrl: './interview-calendar.component.html',
  styleUrls: ['./interview-calendar.component.scss'],
})
export class InterviewCalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {};

  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();

  yearOptions: { label: string; value: number }[] = [];
  monthOptions: { label: string; value: number }[] = [];

  // All interview events with 6 candidates each
  fullEvents: InterviewEvent[] = [
    {
      title: 'Angular Developer Interviews',
      date: '2025-07-20',
      color: '#2196F3',
      candidates: [
        { name: 'Alice', email: 'alice@example.com', mobile: '1234567890', datetime: '2025-05-20 10:00 AM', status: 'Completed' },
        { name: 'David', email: 'david@example.com', mobile: '2345678901', datetime: '2025-05-20 10:30 AM', status: 'Completed' },
        { name: 'Emma', email: 'emma@example.com', mobile: '3456789012', datetime: '2025-05-20 11:00 AM', status: 'In Progress' },
        { name: 'Frank', email: 'frank@example.com', mobile: '4567890123', datetime: '2025-05-20 11:30 AM', status: 'Pending' },
        { name: 'Grace', email: 'grace@example.com', mobile: '5678901234', datetime: '2025-05-20 12:00 PM', status: 'Pending' },
        { name: 'Hannah', email: 'hannah@example.com', mobile: '6789012345', datetime: '2025-05-20 12:30 PM', status: 'Pending' },
      ],
    },
    {
      title: 'Java Developer Interviews',
      date: '2025-05-21',
      color: '#4CAF50',
      candidates: [
        { name: 'Bob', email: 'bob@example.com', mobile: '9876543210', datetime: '2025-05-21 10:00 AM', status: 'In Progress' },
        { name: 'Jack', email: 'jack@example.com', mobile: '8765432109', datetime: '2025-05-21 10:30 AM', status: 'In Progress' },
        { name: 'Kathy', email: 'kathy@example.com', mobile: '7654321098', datetime: '2025-05-21 11:00 AM', status: 'Completed' },
        { name: 'Liam', email: 'liam@example.com', mobile: '6543210987', datetime: '2025-05-21 11:30 AM', status: 'Pending' },
        { name: 'Mona', email: 'mona@example.com', mobile: '5432109876', datetime: '2025-05-21 12:00 PM', status: 'Pending' },
        { name: 'Nate', email: 'nate@example.com', mobile: '4321098765', datetime: '2025-05-21 12:30 PM', status: 'Scheduled' },
      ],
    },
    {
      title: 'HR Discussion',
      date: '2025-06-25',
      color: '#FF9800',
      candidates: [
        { name: 'Charlie', email: 'charlie@example.com', mobile: '9999999999', datetime: '2025-05-25 02:00 PM', status: 'Pending' },
        { name: 'Pam', email: 'pam@example.com', mobile: '9988776655', datetime: '2025-05-25 02:30 PM', status: 'Pending' },
        { name: 'Quinn', email: 'quinn@example.com', mobile: '8877665544', datetime: '2025-05-25 03:00 PM', status: 'Pending' },
        { name: 'Rick', email: 'rick@example.com', mobile: '7766554433', datetime: '2025-05-25 03:30 PM', status: 'Completed' },
        { name: 'Sara', email: 'sara@example.com', mobile: '6655443322', datetime: '2025-05-25 04:00 PM', status: 'In Progress' },
        { name: 'Tom', email: 'tom@example.com', mobile: '5544332211', datetime: '2025-05-25 04:30 PM', status: 'Scheduled' },
      ],
    },
  ];

  // Events filtered by selected year/month
  filteredEvents: InterviewEvent[] = [];

  // Detail view state
  showCalendar: boolean = true;
  showTableView: boolean = false;
  selectedCandidates: Candidate[] = [];

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.yearOptions = Array.from({ length: 40 }, (_, i) => ({
      label: (currentYear - 15 + i).toString(),
      value: currentYear - 15 + i,
    }));

    this.monthOptions = Array.from({ length: 12 }, (_, i) => ({
      label: new Date(0, i).toLocaleString('default', { month: 'long' }),
      value: i,
    }));

    this.initializeCalendar(this.selectedYear, this.selectedMonth);
    this.applyFilter();
  }

  initializeCalendar(year: number, month: number) {
    const selectedDate = new Date(year, month, 1);

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      initialDate: selectedDate,
      headerToolbar: { left: 'prev,next', center: '', right: '' },
      events: this.fullEvents.map(e => ({
        title: e.title,
        date: e.date,
        color: e.color
      })),
      eventClick: info => this.handleEventClick(info.event),
    };

    // If calendar already rendered, navigate
    setTimeout(() => {
      const api = this.calendarComponent?.getApi();
      api?.gotoDate(selectedDate);
    });
  }

  onYearChange(event: any) {
    this.selectedYear = event.value;
    this.onFilterChange();
  }

  onMonthChange(event: any) {
    this.selectedMonth = event.value;
    this.onFilterChange();
  }

  private onFilterChange() {
    this.initializeCalendar(this.selectedYear, this.selectedMonth);
    this.applyFilter();
    this.showCalendar = true;
    this.showTableView = false;
    this.selectedCandidates = [];
  }

  private applyFilter() {
    this.filteredEvents = this.fullEvents.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === this.selectedYear && d.getMonth() === this.selectedMonth;
    });
  }

  handleEventClick(event: any) {
    const found = this.fullEvents.find(
      e => e.title === event.title && e.date === event.startStr
    );
    if (found) {
      this.selectedCandidates = found.candidates;
      this.showCalendar = false;
      this.showTableView = true;
    }
  }

  backToCalendar() {
    this.showCalendar = true;
    this.showTableView = false;
    this.selectedCandidates = [];
  }
}
