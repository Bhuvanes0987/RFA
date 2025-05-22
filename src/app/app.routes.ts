import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './shared/components/login/login.component';
import { OverviewComponent } from './shared/components/overview/overview.component';
import { ResumeUploadComponent } from './master/components/resume-upload/resume-upload.component';
import { ResumeListComponent } from './master/components/resume-list/resume-list.component';
import { SortListComponent } from './master/components/sort-list/sort-list.component';
import { JdListComponent } from './master/components/jd-list/jd-list.component';
import { InterviewCalendarComponent } from './master/components/interview-calendar/interview-calendar.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'dashboard', component: OverviewComponent },
      { path: 'resumeupload', component: ResumeUploadComponent },
      { path: 'resumelist', component: ResumeListComponent },
      { path: 'short-list', component: SortListComponent },
      { path: 'jd-list', component: JdListComponent },
      { path: 'interview-calendar', component: InterviewCalendarComponent },
    ],
  },
];
