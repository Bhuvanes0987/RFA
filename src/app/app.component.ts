import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { TableModule } from 'primeng/table';
import { HeaderComponent } from './shared/components/header/header.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './shared/components/login/login.component';
import { NavigationComponent } from './shared/components/navigation/navigation.component';
import { OverviewComponent } from './shared/components/overview/overview.component';
import { UserprofileComponent } from './shared/components/userprofile/userprofile.component';
// import { RoledetailsComponent } from './master/components/roledetails/roledetails.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoginComponent,
    OverviewComponent,
    UserprofileComponent,
    LayoutComponent,
    HeaderComponent,
    NavigationComponent,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'RFA';
  constructor() {}
}
