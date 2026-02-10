import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthenticationService } from '../core/auth/auth.service';
import { LanguageService } from '../core/language/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../core/tenant/tenant.service';
import { BASE_PATH } from '../api/variables';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslateModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3 cursor-pointer" routerLink="/dashboard">
            @if (tenantService.currentTenant()?.logoUrl) {
              <div class="h-12 w-auto max-w-48 flex items-center justify-center overflow-hidden">
                <img
                  [src]="basePath + tenantService.currentTenant()?.logoUrl"
                  class="h-full w-full object-contain"
                />
              </div>
            } @else {
              <div class="bg-indigo-600 rounded-lg p-2 shadow-lg shadow-indigo-100">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
                  />
                </svg>
              </div>
            }
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight italic">
              {{ tenantService.currentTenant()?.name || 'Bifrost' }}
              <span class="text-indigo-600">LMS</span>
            </h1>
          </div>

          <div class="flex items-center space-x-6">
            <!-- Language Toggle -->
            <div class="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
              <button
                (click)="languageService.setLanguage('en')"
                [class.bg-white]="languageService.currentLang() === 'en'"
                [class.shadow-sm]="languageService.currentLang() === 'en'"
                class="px-3 py-1 rounded-full text-xs font-bold transition-all"
                [class.text-indigo-600]="languageService.currentLang() === 'en'"
                [class.text-gray-400]="languageService.currentLang() !== 'en'"
              >
                EN
              </button>
              <button
                (click)="languageService.setLanguage('vi')"
                [class.bg-white]="languageService.currentLang() === 'vi'"
                [class.shadow-sm]="languageService.currentLang() === 'vi'"
                class="px-3 py-1 rounded-full text-xs font-bold transition-all"
                [class.text-indigo-600]="languageService.currentLang() === 'vi'"
                [class.text-gray-400]="languageService.currentLang() !== 'vi'"
              >
                VI
              </button>
            </div>

            <!-- Profile Section -->
            <div class="flex items-center space-x-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-gray-900">
                  {{
                    (authService.userRole() === 'Student'
                      ? 'AUTH.STUDENT'
                      : authService.userRole() === 'Teacher'
                        ? 'AUTH.TEACHER'
                        : 'AUTH.ADMIN'
                    ) | translate
                  }}
                </p>
                <p class="text-xs font-medium text-gray-500 tracking-wider mt-1">
                  {{ authService.email() }}
                </p>
                <button
                  (click)="logout()"
                  class="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Logout
                </button>
              </div>
              <div class="relative">
                <div
                  class="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                >
                  <span class="text-indigo-600 font-bold text-sm">
                    {{ (authService.userRole() || 'U').charAt(0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class MainLayoutComponent {
  authService = inject(AuthenticationService);
  tenantService = inject(TenantService);
  languageService = inject(LanguageService);
  basePath = inject(BASE_PATH);
  router = inject(Router);

  logout() {
    this.authService.logout();
  }
}
