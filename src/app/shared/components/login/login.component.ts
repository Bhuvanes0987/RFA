import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onEmailInput(event: any): void {
    const inputValue = event.target.value;
    const domain = '@excelenciaconsulting.com';
    if (inputValue.includes('@') && !inputValue.endsWith(domain)) {
      const prefix = inputValue.split('@')[0];
      const updatedEmail = prefix + domain;
      this.loginForm.get('email')?.setValue(updatedEmail);
    }
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
     
      window.location.href = `${environment.SERVER_URL}/microsoft/login?email=${encodeURIComponent(email)}`;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Email',
        detail: 'Please enter a valid email address.'
      });
    }
  }
}
