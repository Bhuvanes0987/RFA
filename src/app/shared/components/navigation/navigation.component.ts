import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    DialogModule,
    StyleClassModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent implements OnInit {
  @Input() sidebarCollapsed = false;
  userRole: string = 'Manager';

  menu: MenuItem[] = [
    { name: 'Dashboard', path: 'dashboard', icon: 'monitoring' },
    { name: 'Resume Upload', path: 'resumeupload', icon: 'cloud_upload' },
    // { name: 'Resume List', path: 'resumelist', icon: 'folder' },
    { name: 'Short List', path: 'short-list', icon: 'description' },
    { name: 'JD List', path: 'jd-list', icon: 'description' }, 
    { name: 'Calendar', path: 'interview-calendar', icon: 'calendar_today' },   
    // {
    //   name: 'Settings',
    //   children: [
    //     { name: 'Application Role', path: 'roles', icon: '' },
    //     { name: 'Manage User', path: 'manageuser', icon: '' },
    //     { name: 'Priority', path: 'priority', icon: 'priority' },
    //     { name: 'SLA', path: 'SLA', icon: 'handshake' },
    //     { name: 'Complexity', path: 'complexity', icon: 'settings' },
    //   ],
    //   path: '',
    //   icon: 'settings',
    // },    
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // const userRole = localStorage.getItem('role');

    if (this.userRole !== 'Administrator' && this.userRole !== 'Manager') {
      this.menu = this.filterMenu(this.menu);
    }
  }

  filterMenu(menu: MenuItem[]): MenuItem[] {
    return menu.filter((item) => {
      if (item.children && item.children.length > 0) {
        item.children = this.filterMenu(item.children);
      }
      return (
        item.name !== 'Clients' &&
        item.name !== 'Reports' &&
        item.name !== 'Projects' &&
        item.name !== 'Priority' &&
        item.name !== 'Roles'
      );
    });
  }

 
  navigateToPriority() {
    console.log('Navigating to Priority page...');
    this.router.navigateByUrl('/priority');
  }
}

export interface MenuItem {
  name: string;
  path?: string;
  icon?: string;
  external?: boolean;
  children?: MenuItem[];
}
