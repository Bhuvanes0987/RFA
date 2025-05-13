import { Component, Input, OnInit } from '@angular/core';
import { UserprofileComponent } from '../userprofile/userprofile.component';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    UserprofileComponent,IconFieldModule,InputIconModule,InputTextModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{

  showNotification = false;
  Menuitem : string  = '';
  @Input() title: string='';

  constructor(private router: Router) { }

  items: MenuItem[] | undefined;

  // home: MenuItem | undefined;

  ngOnInit() {
    // Get last segment of url
    const url = window.location.href;
    const res = url.split("/");
    const pos = res.indexOf('app');
    const result = res[pos + 1];
    this.Menuitem = result;

    // this.items = [{ label: "Settings" }];
    // this.home = { label: 'Home', icon: 'pi', routerLink: '/app/home' };
  }

}
