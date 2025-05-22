import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterviewCalendarComponent } from './interview-calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';

describe('InterviewCalendarComponent', () => {
  let component: InterviewCalendarComponent;
  let fixture: ComponentFixture<InterviewCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FullCalendarModule,
        InterviewCalendarComponent // standalone component
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterviewCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

