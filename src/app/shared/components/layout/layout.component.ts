import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuItem, NavigationComponent } from '../navigation/navigation.component';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';



@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ButtonModule, NavigationComponent, HeaderComponent, RouterOutlet,TooltipModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  sidebarCollapsed!: boolean;
  title = '';
  icon='';
  menu : MenuItem[]=[
    { name: 'Overview', path: 'overview', icon: 'monitoring' },
  ];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {

    
    const windowWidth = window.outerWidth;
    
    if (windowWidth >= 1200) {
      this.sidebarCollapsed = false;
      this.renderer.removeClass(document.body, 'sidebar-closed');
      // this.renderer.addClass(document.body, 'sidebar-open');
    } else if (windowWidth < 1200) {
      this.sidebarCollapsed = true;
      // this.renderer.removeClass(document.body, 'sidebar-open');
      this.renderer.addClass(document.body, 'sidebar-closed');
    }
  }

  toggleSidebar() {

    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
      this.renderer.removeClass(document.body, 'sidebar-closed');
      // this.renderer.addClass(document.body, 'sidebar-open');
    } else {
      this.sidebarCollapsed = true;
      // this.renderer.removeClass(document.body, 'sidebar-open');
      this.renderer.addClass(document.body, 'sidebar-closed');
    }
  }

  // setHeader() {
  //   let path = this.router.url.split('/')[1];
  //   if (path.includes('-')) {
  //     path = path.replace(/-/g, ' ');
  //   }
  //   this.title = path.replace(/\b\w/g, (char) => char.toUpperCase());
  //   this.icon = 'arrow_right';
  // }
  
  getTooltipText(): string {
    return this.sidebarCollapsed ? 'View Sidebar' : 'Hide Sidebar';
  }
}
