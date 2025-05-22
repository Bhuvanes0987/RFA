import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { JdService } from '../../services/jd.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-jd-list',
  standalone: true,
  imports: [
      CommonModule,
      TableModule,
      InputTextModule,
      FormsModule,
      TooltipModule,
      ToastModule,
      ButtonModule,
    ],
  templateUrl: './jd-list.component.html',
  styleUrls: ['./jd-list.component.scss'],
})
export class JdListComponent implements OnInit {
  jdList: any[] = [];
  filteredJdList: any[] = [];
  filterKeyword: string = '';

  constructor(
    private jdService : JdService,
    private messageService : MessageService
  ) {}

  ngOnInit(): void {
    this.jdService.setAndGetJDList().subscribe({
    next: (data) => {
      this.jdList = data.map(jd => ({ Description: jd }));
      this.filteredJdList = [...this.jdList];
      console.log(this.filteredJdList);
    },
    error: (err) => {
      console.error('Failed to fetch JD list:', err);
    }
  });
  }

  onFilter() {
    const keyword = this.filterKeyword.toLowerCase().trim();
    this.filteredJdList = this.jdList.filter(jd =>
      jd?.toLowerCase().includes(keyword)
    );
  }

  copyJD(description: string) {
    navigator.clipboard.writeText(description).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: 'JD copied to clipboard',
        life: 1500
      });
    }).catch(err => {
      this.messageService.add({
        severity: 'error',
        summary: 'Failed',
        detail: 'Unable to copy JD',
        life: 1500
      });
    });
  }

  getJdList(): any[] {
    return [];
  }
}

