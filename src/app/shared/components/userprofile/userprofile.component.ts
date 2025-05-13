import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { OverlayModule } from 'primeng/overlay';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { LoginService } from '../../services/login.service';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { Location } from '@angular/common';
import { AuthGuard } from '../../services/auth.guard';


@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [
    SidebarModule,
    CommonModule,
    ButtonModule,
    OverlayModule,
    OverlayPanelModule,
    RouterLink,
    DividerModule,BadgeModule,
    MessagesModule
    // ,BrowserModule,BrowserAnimationsModule
  ],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.scss'
})
export class UserprofileComponent implements OnInit{

  email!: any;
  isLogged : boolean = false;
  data : string = '';
  user! : User;
  name! : string;
  role! : string;
  badgeValue: string ='2+';
  sidebarVisible :boolean = false;
  userDetails!:any;
  @ViewChild('accountMenu') accountMenu!: OverlayPanel;

  constructor(private router: Router,
    private loginService: LoginService,
    private messageService: MessageService,
    private authService :AuthGuard,
    private location: Location,) {


  }
  ngOnInit() {
    const name = sessionStorage.getItem("name");
    if (name) {
      this.name = name;
    }
  }
  onHideOverlay() {
    if (this.accountMenu) {
      this.accountMenu.hide();
    }
  } 

  
  getFirstLetters(): string {
    const nameParts = this.name.split(' ');
    const firstLetterFirstWord = nameParts[0]?.charAt(0).toUpperCase();
    const firstLetterSecondWord = nameParts.length > 1 ? nameParts[1]?.charAt(0).toUpperCase() : '';
  
    return firstLetterFirstWord + firstLetterSecondWord;
  }
  

  logout() {
    setTimeout(() => {
      sessionStorage.clear();
      //localStorage.clear();
      this.loginService.isLoggedIn = false;      
      this.router.navigate(['/login'])
  }, 700);
  this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Logged Out!!! See You..' });
  }
  toggleSidebar() {
    this.badgeValue = '0';
    this.sidebarVisible = !this.sidebarVisible;
  }
}


interface User {
  authToken: string;
  isOTPRequired: boolean;
  emailId: string;
  roleId: number;
}
