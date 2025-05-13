// src/app/shared/components/overview/overview.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
  ApexOptions,
  ApexFill
} from 'ng-apexcharts';

interface LocationData {
  name: string;
  profiles: number;
  children?: LocationData[];
  expanded?: boolean;
}

interface GenderCounts {
  Male: number;
  Female: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="dashboard-container">
      <div class="summary-cards">
        <div class="card top-candidates-card">
          <h3>Top Candidates (85%+)</h3>
          <p>{{ topCandidates.length }}</p>
        </div>
        <div class="card resumes-uploaded-card">
          <h3>Resumes Uploaded Today</h3>
          <p>{{ resumesUploadedToday }}</p>
        </div>
        <div class="card average-match-card">
          <h3>Avg. Match %</h3>
          <p>{{ averageMatch | number: '1.0-0' }}%</p>
        </div>
        <div class="card shortlisted-card">
          <h3>Shortlisted</h3>
          <p>{{ shortlistedCount }}</p>
        </div>
      </div>

      <div class="charts">
        <div class="chart-card skills-chart">
          <apx-chart
            *ngIf="barChartOptions?.series"
            style="width: 100%;"  
            [series]="barChartOptions?.series ?? []"
            [chart]="barChartOptions?.chart ?? { type: 'bar' }"
            [xaxis]="barChartOptions?.xaxis ?? {}"
            [plotOptions]="barChartOptions?.plotOptions ?? {}"
            [dataLabels]="barChartOptions?.dataLabels ?? {}"
            [title]="barChartOptions?.title ?? {}"
            [colors]="barChartOptions?.colors ?? []">
          </apx-chart>
        </div>

        <div class="chart-card location-matrix-card">
          <div class="matrix-section">
            <h3>Location Profiles</h3>
            <div class="location-matrix">
              <div class="header">
                <span>Place</span>
                <span>Profiles</span>
              </div>
              <div class="matrix-body">
                <div *ngFor="let item of locationData">
                  <div class="row level-1">
                    <span *ngIf="item.children && item.children.length > 0"
                          class="toggle-icon"
                          [class.expanded]="item.expanded"
                          [class.collapsed]="!item.expanded"
                          (click)="toggleChildren(item)">
                    </span>
                    <span *ngIf="!(item.children && item.children.length > 0)" class="toggle-icon-placeholder"></span>
                    <span class="place-column">{{ item.name }}</span>
                    <span class="profiles-column">{{ item.profiles }}</span>
                  </div>
                  <div *ngIf="item.children && item.expanded">
                    <div *ngFor="let child of item.children" class="row level-2">
                      <span class="place-column level-2">{{ child.name }}</span>
                      <span class="profiles-column">{{ child.profiles }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <span class="place-column">Total</span>
                <span class="profiles-column">{{ totalProfiles }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card skill-pie-chart">
          <apx-chart
            *ngIf="pieChartOptions?.series"
            [series]="pieChartOptions?.series ?? []"
            [chart]="pieChartOptions?.chart ?? { type: 'pie' }"
            [labels]="pieChartOptions?.labels ?? []"
            [legend]="pieChartOptions?.legend ?? {}"
            [title]="pieChartOptions?.title ?? {}"
            [tooltip]="pieChartOptions?.tooltip ?? {}"
            [colors]="pieChartOptions?.colors ?? []">
          </apx-chart>
        </div>

        <div class="chart-card gender-count-card">
          <h3>Gender</h3>
          <div class="gender-info">
            <div class="male">
              <span class="male-icon"></span>
              <span>{{ genderCounts?.Male || 0 }}</span>
            </div>
            <div class="female">
              <span class="female-icon"></span>
              <span>{{ genderCounts?.Female || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      display: flex;
      flex-direction: column; /* Ensure elements stack vertically */
      gap: 20px; /* Spacing between sections */
    }

    .summary-cards {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      flex: 1;
      min-width: 200px;
      padding: 15px;
      border-radius: 10px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .top-candidates-card {
      background-image: linear-gradient(to bottom, #00B8D4, #00869e);
    }
    .resumes-uploaded-card {
      background-image: linear-gradient(to bottom, #00E676, #00a354);
    }
    .average-match-card{
      background-image: linear-gradient(to bottom, #FFD740, #c6a700);
    }
    .shortlisted-card {
      background-image: linear-gradient(to bottom, #8E24AA, #6a1b9a);
    }

    .card h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 1.2em;
      font-weight: bold;
    }

    .card p {
      font-size: 1.5em;
      font-weight: bold;
      text-align: center;
    }

    .charts {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr; /* Initially set 3 equal columns */
      gap: 20px;
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      grid-template-rows: auto auto; /* Allow rows to adjust based on content */
    }

    .chart-card {
      /* Styles for individual chart cards if needed */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .skills-chart {
      grid-column: span 3; /* Make the skills bar chart span the entire first row */
    }

    .location-matrix-card {
      /* Takes up one column in the second row */
    }

    .skill-pie-chart {
      /* Takes up one column in the second row */
    }

    .gender-count-card {
      /* Takes up one column in the second row */
      text-align: center;
    }

    .gender-count-card h3 {
      margin-bottom: 10px;
    }

    .gender-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .male, .female {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 1.1em;
    }

    .male-icon::before {
      content: '👤'; /* Unicode for male icon */
      color: #007bff; /* Blue color */
      font-size: 1.5em;
    }

    .female-icon::before {
      content: '🚺'; /* Unicode for female icon */
      color: #e83e8c; /* Pink color */
      font-size: 1.5em;
    }

    .matrix-section {
      margin-bottom: 20px;
      border: 1px solid #eee;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: white;
      width: 100%; /* Make the section take full width */
    }

    .location-matrix {
      display: flex; /* Enable flexbox for layout control */
      flex-direction: column; /* Stack header, body, footer vertically */
      border: 1px solid #ccc;
      border-radius: 5px;
      width: 100%; /* Make the matrix take full width */
      font-family: sans-serif;
    }

    .header, .footer {
      background-color: #f0f0f0;
      color: #333;
      display: flex;
      justify-content: space-between;
      padding: 8px 10px;
      font-weight: bold;
      width: 100%; /* Ensure header and footer take full width */
    }

    .matrix-body {
      background-color: #34495e;
      color: white;
      width: 100%; /* Ensure body takes full width */
    }

    .row {
      display: flex;
      width: 100%; /* Make each row take full width */
      padding: 8px 10px;
      border-bottom: 1px solid #2c3e50;
      align-items: center;
    }

    .row:last-child {
      border-bottom: none;
    }

    .row.level-1 {
      font-weight: bold;
    }

    .row.level-2 {
      padding-left: 30px; /* Add more indentation for level 2 */
    }

    .toggle-icon {
      cursor: pointer;
      margin-right: 5px;
      flex-shrink: 0; /* Prevent icon from shrinking */
    }

    .expanded::before {
      content: "−";
    }

    .collapsed::before {
      content: "+";
    }

    .toggle-icon-placeholder {
      width: 1em;
      display: inline-block;
      margin-right: 5px;
      flex-shrink: 0; /* Prevent placeholder from shrinking */
    }

    .place-column {
      flex-grow: 1; /* Allow place column to take up available space */
    }

    .profiles-column {
      flex-shrink: 0; /* Prevent profiles column from shrinking */
      text-align: right; /* Align profiles to the right */
      width: 50px; /* Give a fixed width for better alignment */
    }

    .place-column.level-2 {
      padding-left: 30px; /* Add more indentation for level 2 */
    }
  `]
})
export class OverviewComponent implements OnInit {
  resumeData = [
    { name: 'Jobin', gender: 'Male', skills: ['Java', 'Spring'], experience: 5, matchPercentage: 90, status: 'Shortlisted', uploadedAt: new Date(Date.now() - 1000 * 60 * 10) },
    { name: 'Thivya', gender: 'Female', skills: ['Java', 'React'], experience: 3, matchPercentage: 85, status: 'Under Review', uploadedAt: new Date(Date.now() - 1000 * 60 * 30) },
    { name: 'Rushil', gender: 'Male', skills: ['Java', 'Angular'], experience: 4, matchPercentage: 80, status: 'Rejected', uploadedAt: new Date(Date.now() - 1000 * 60 * 90) },
    { name: 'Bhuvanesh', gender: 'Male', skills: ['Java', 'Spring', 'SQL'], experience: 6, matchPercentage: 92, status: 'Shortlisted', uploadedAt: new Date(Date.now() - 1000 * 60 * 5) },
    { name: 'Aswini', gender: 'Female', skills: ['Java', 'Hibernate'], experience: 2, matchPercentage: 75, status: 'Under Review', uploadedAt: new Date(Date.now() - 1000 * 60 * 20) },
    { name: 'Aashika', gender: 'Female', skills: ['Java', 'Hibernate'], experience: 2, matchPercentage: 99, status: 'Under Review', uploadedAt: new Date(Date.now() - 1000 * 60 * 2) }
  ];

  locationData: LocationData[] = [
    {
      name: "India",
      profiles: 5,
      children: [
        { name: "Bangalore", profiles: 2 },
        { name: "Chennai", profiles: 2 },
        { name: "Hyderabad", profiles: 1 },
      ],
      expanded: false,
    },
    {
      name: "US",
      profiles: 4,
      children: [
        { name: "Texas", profiles: 4 },
      ],
      expanded: false,
    },
    {
      name: "Canada",
      profiles: 2,
      children: [
        { name: "Ontario", profiles: 1 },
        { name: "Quebec", profiles: 1 },
      ],
      expanded: false,
    },
    {
      name: "Germany",
      profiles: 2,
      children: [
        { name: "Berlin", profiles: 1 },
        { name: "Munich", profiles: 1 },
      ],
      expanded: false,
    },
  ];

  totalProfiles: number = 0;
  topCandidates = this.resumeData.filter(r => r.matchPercentage >= 85);
  resumesUploadedToday = this.resumeData.filter(r =>
    new Date(r.uploadedAt).toDateString() === new Date().toDateString()
  ).length;
  averageMatch = Math.round(this.resumeData.reduce((sum, r) => sum + r.matchPercentage, 0) / this.resumeData.length);
  shortlistedCount = this.resumeData.filter(r => r.status === 'Shortlisted').length;

  pieChartOptions: ApexOptions | undefined;
  barChartOptions: ApexOptions | undefined;
  genderCounts: GenderCounts | undefined;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.calculateTotalProfiles();
    const skillCounts = this.getSkillCounts();
    this.genderCounts = this.getGenderCounts();

    this.pieChartOptions = {
      series: [10, 20, 30, 40],
      chart: {
        type: 'pie',
        height: 350,
      },
      labels: ['Java', 'Spring', 'React', 'Angular'],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center'
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
      title: {
        text: 'Skill Distribution',
        align: 'center',
        style: { color: '#444' }
      },
      tooltip: {
        y: {
          formatter: (val: number, opts?: any) => {
            const label = opts?.w?.globals?.labels[opts.seriesIndex];
            return `${label}: ${val} candidate${val !== 1 ? 's' : ''}`;
          }
        }
      }
    };

    this.barChartOptions = {
      series: [{
        name: 'Candidates',
        data: Object.values(skillCounts),
      }],
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          horizontal: true,
          distributed: true,
        },
      },
      dataLabels: { enabled: true },
      xaxis: {
        categories: Object.keys(skillCounts),
        title: { text: 'Skills', style: { color: '#444' } }
      },
      yaxis: {
        title: { text: 'No. of Candidates', style: { color: '#444' } }
      },
      title: {
        text: 'Skills in Resumes',
        align: 'center',
        style: { color: '#444' }
      },
      colors: ['#00B8D9', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A'],
      
      };

    this.changeDetectorRef.detectChanges();
  }

  toggleChildren(item: LocationData) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  calculateTotalProfiles() {
    this.totalProfiles = this.locationData.reduce((sum, item) =>
      sum + item.profiles + (item.children?.reduce((childSum, child) => childSum + child.profiles, 0) || 0), 0);
  }

  private getSkillCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.resumeData.forEach(r => {
      r.skills.forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return counts;
  }

  private getGenderCounts(): GenderCounts {
    const counts: GenderCounts = { Male: 0, Female: 0 };
    this.resumeData.forEach(r => {
      if (r.gender === 'Male') counts.Male++;
      else if (r.gender === 'Female') counts.Female++;
    });
    return counts;
  }
}
