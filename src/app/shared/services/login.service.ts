import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { baseUrl } from '../../commons/global.common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public isLoggedIn: boolean = false;
  private readonly AUTH_TOKEN_KEY = 'authToken';
  
  constructor(private httpClient: HttpClient) { 
    this.isLoggedIn = !!localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  public setIsLoggedIn(value: boolean) {
    if (value) {
      // Set authentication token in local storage
      sessionStorage.setItem(this.AUTH_TOKEN_KEY, 'JWL');
    this.isLoggedIn = value;
    console.log(this.isLoggedIn);
  }else{
    sessionStorage.removeItem(this.AUTH_TOKEN_KEY);
 
  }
}
  
   
}
