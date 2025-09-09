import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// 1. Importe as novas funções
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
// 2. Importe os nossos interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// --- 1. IMPORTS NECESSÁRIOS PARA A DATA ---
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import localePt from '@angular/common/locales/pt';

// --- 2. REGISTRAR O LOCALE PORTUGUÊS DO BRASIL ---
registerLocaleData(localePt);

// --- 3. DEFINIR O FORMATO DE DATA CUSTOMIZADO ---
export const MAT_BRAZIL_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),

    // 3. Modifique esta linha para incluir ambos os interceptors
    provideHttpClient(withInterceptors([
      authInterceptor,
      errorInterceptor
    ])),
  

    // --- 4. ADICIONAR OS PROVIDERS DE DATA ---
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: MAT_BRAZIL_DATE_FORMATS },
  // Labels dos campos sempre flutuando para evitar conflito com placeholders
  { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },
  ]
};