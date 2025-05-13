import { Injectable } from '@angular/core';
import {Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';
 
@Injectable({
  providedIn: 'root'
})
 
export class AuthGuard {
  private loggedIn = false;
  constructor(private loginService : LoginService,
    private router : Router){
      window.onpopstate = () => {
        this.preventBackNavigation();
      };
    }
    preventBackNavigation(): void {
      if (this.router.url === '/login') {
        history.pushState(null, '', '/login');
        this.router.navigate(['/login']);
      }
    }

   
  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if(this.loginService.isLoggedIn){
 
      return true;
    }
    else{
      this.router.navigateByUrl('/login');
      return false;
    }
 
  }
  // logout() {
  //   this.loginService.isLoggedIn = false;
  //   localStorage.removeItem(''); // Remove token or any session data
  // }
 
}