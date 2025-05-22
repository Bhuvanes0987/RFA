import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import JSZip from 'jszip';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http'; 
import { ResumeService } from '../../services/resume.service';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { JdService } from '../../services/jd.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FileUploadModule,
    InputTextModule,
    FormsModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './resume-upload.component.html',
  styleUrls: ['./resume-upload.component.scss']
})
export class ResumeUploadComponent {
  jdFilter: string = '';

  resumes: any[] = [];
  selectedResumes: any[] = [];

  constructor(
    private http: HttpClient, 
    private resumeService : ResumeService,
    private jdService : JdService,
    private messageService : MessageService,
    private router : Router) {
      const stored = localStorage.getItem("Matches");
      if (stored) {
        this.resumes = JSON.parse(stored); //  Properly parse JSON string
      }
      //console.log("STORED",stored);
      this.selectedResumes = this.resumeService.getSelectedResumes();
    } 

  onUpload(event: any): void {
    const file = event.files[0];
    if (!file || !file.name.endsWith('.zip')) {
      console.error('Invalid file type. Please upload a ZIP file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('search', this.jdFilter); // Or dynamically from an input field

    this.http.post<any>(environment.SERVER_URL+'/filter', formData).subscribe({
      next: (response) => {
        this.resumes = response.Matches;
        console.log(this.resumes[0]);
        localStorage.setItem("Matches",JSON.stringify(response.Matches));

        this.jdService.setAndGetJDList(true);
        
        console.log('Upload response:', localStorage.getItem("Matches"));
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  saveSelected() {
    console.log("Selected Resumes:", this.selectedResumes);
  
    // Example: Store in service for next page access
    this.resumeService.setSelectedResumes(this.selectedResumes);
  
    // Navigate to another page (e.g., /review)
    setTimeout(() => {
      this.router.navigate(['/short-list']);
    }, 700);
    
  }

  onRowUnselected(event: any) {
    const resume = event.data;
    this.selectedResumes = this.selectedResumes.filter(r => r.ID !== resume.ID);
  }

  copySkills(skills: string[]): void {
    const skillText = skills.join(', ');
    navigator.clipboard.writeText(skillText).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: 'Skills copied to clipboard',
        life: 1500
      });
    }).catch(err => {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Unable to copy skills',
        life: 1500
      });
    });
  }
}
