import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ResumeService } from '../../services/resume.service';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-resume-list',
  templateUrl: './sort-list.component.html',
  styleUrls: ['./sort-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageModule,
    TableModule,
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class SortListComponent {
  resumes: any[] = [];
  filteredResumes: any[] = [];
  filterKeyword: string = '';

  constructor(
    private resumeService : ResumeService,
    private messageService:  MessageService,
    private http: HttpClient
  ) {
    
    this.resumes = this.resumeService.getSelectedResumes();

    this.filteredResumes = [...this.resumes];
  }

  onFilter() {
    const keyword = this.filterKeyword.toLowerCase().trim();
    console.log(keyword);
    this.filteredResumes = this.resumes.filter(resume => {
      const combined = `${resume.FName} ${resume.LName} ${resume.Email} ${resume.Phone} ${resume.Position} ${resume.Experience} ${resume.Score} ${resume.Date}`.toLowerCase();
      console.log(combined);
      console.log(combined.includes(keyword));
      return combined.includes(keyword);
    });
  }

    viewResume(filepath: string) {
      const fileUrl = `${environment.SERVER_URL}/download/${filepath}`;
      window.open(fileUrl, '_blank');
    }

    downloadResume(filepath: string) {
      const a = document.createElement('a');
      a.href = `${environment.SERVER_URL}/download/${filepath}`;
      a.download = filepath
      a.click();
    }

    sendMail(receiverMail: string) {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      const payload = {
        sender: user.email,
        to_email: receiverMail,
        subject: 'You have been shortlisted!',
        body: `Dear Candidate,
        We are pleased to inform you that you have been shortlisted for the next round of interviews at Excelencia.
        To proceed, please select a suitable time slot for your interview from the following:

        <Placeholder Link>

        Kindly confirm your slot and reply to this mail address.

        We look forward to speaking with you soon!

        Best regards,
        Allen
        HR
        Excelencia
        +1-23456-78901`
      };
  
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      this.http.post(`${environment.SERVER_URL}/send-mail`, payload, { headers })
        .subscribe({
          next: (response) => {
            console.log('Mail sent successfully:', response);
            // Show a message to user or navigate
            this.messageService.add({
              severity: 'success',
              summary: 'Sent!',
              detail: `Mail sent to ${payload.to_email}`,
              life: 1000
            });
          },
          error: (error) => {
            console.error('Error sending mail:', error);
            // Show error message to user
            this.messageService.add({
              severity: 'error',
              summary: 'Failed!',
              detail: "Could not send mail",
              life: 1000
            });
          }
        });
    }

    copySkills(skills: string[]): void {
      const skillText = skills.join(', ');
      navigator.clipboard.writeText(skillText).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copied!',
          detail: 'Skills copied to clipboard',
          life: 1000
        });
      }).catch(err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Unable to copy skills',
          life: 1000
        });
      });
    }
}
