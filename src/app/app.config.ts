import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
// import { provideClientHydration } from '@angular/localize/init';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { MetricsCalculationPipe } from './shared/pipes/metrics-calculation.pipe';


export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(), DatePipe,
  provideAnimations(), DropdownModule,MessageService,ConfirmationService,MessagesModule, MetricsCalculationPipe]
};
