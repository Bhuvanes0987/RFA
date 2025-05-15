import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';


import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes'; // This contains your routing setup

// PrimeNG and other services
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';

import { DatePipe } from '@angular/common';
import { MetricsCalculationPipe } from './shared/pipes/metrics-calculation.pipe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideAnimations(),
    DatePipe,
    DropdownModule,
    MessageService,
    ConfirmationService,
    MessagesModule,
    MetricsCalculationPipe
  ]
};
