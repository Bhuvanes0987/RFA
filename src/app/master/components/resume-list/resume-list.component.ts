import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';

@Component({
  standalone: true,
  selector: 'app-resume-list',
  templateUrl: './resume-list.component.html',
  styleUrls: ['./resume-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageModule,
    TableModule
  ]
})
export class ResumeListComponent {
  resumes: any[] = [];
  filteredResumes: any[] = [];
  filterKeyword: string = '';

  constructor() {
    const storedResumes = localStorage.getItem('uploadedResumes');
    this.resumes = storedResumes ? JSON.parse(storedResumes) : [];

    // Ensure each resume has a `resumeUrl` (used for viewing/downloading)
    this.resumes.forEach(resume => {
      if (resume.base64 && !resume.resumeUrl) {
        resume.resumeUrl = resume.base64;
      }
    });

    this.filteredResumes = [...this.resumes];
  }

  onFilter() {
    const keyword = this.filterKeyword.toLowerCase().trim();
    this.filteredResumes = this.resumes.filter(resume => {
      const combined = `${resume.name} ${resume.email} ${resume.mobile} ${resume.position} ${resume.experience}`.toLowerCase();
      return combined.includes(keyword);
    });
  }

  viewResume(base64: string, fileName: string) {
    const blob = this.base64ToBlob(base64, 'application/pdf');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  downloadResume(base64: string, fileName: string) {
    const blob = this.base64ToBlob(base64, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
