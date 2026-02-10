import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { BASE_PATH } from './api/variables';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: BASE_PATH, useValue: 'http://localhost:5186' },
    provideTranslateService({
      defaultLanguage: 'vi',
    }),
    ...provideTranslateHttpLoader({
      prefix: 'assets/i18n/',
      suffix: '.json',
    }),
  ],
};
