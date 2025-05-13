import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private selectedResumes: any[] = [];

  setSelectedResumes(resumes: any[]): void {
    //const existingResumes = this.getSelectedResumes();
    this.selectedResumes = resumes;
    // Combine existing and new resumes
    /*const combined = [...existingResumes, ...this.selectedResumes];

    // Remove duplicates by ID (or any unique property)
    const deduplicated = combined.filter(
      (resume, index, self) =>
        index === self.findIndex(r => r.ID === resume.ID)
    );

    this.selectedResumes = deduplicated;*/
    localStorage.setItem('selectedResumes', JSON.stringify(this.selectedResumes));
  }

  getSelectedResumes(): any[] {
    const parsedResumes = localStorage.getItem('selectedResumes')
    if (parsedResumes) {
      return JSON.parse(parsedResumes);
    }
    else
    return [];
  }
}
