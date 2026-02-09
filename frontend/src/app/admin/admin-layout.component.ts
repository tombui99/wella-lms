import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthenticationService } from '../core/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-72 bg-indigo-900 text-white flex flex-col shadow-2xl z-20">
        <div class="p-8 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="bg-indigo-600 p-2 rounded-xl shadow-lg ring-1 ring-white/20">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
                />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-black italic tracking-tight">Bifrost</h1>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <a
            routerLink="/admin/users"
            routerLinkActive="bg-white/10 text-white shadow-lg"
            class="flex items-center gap-4 px-5 py-4 rounded-2xl text-indigo-100 hover:bg-white/5 transition-all group font-bold"
          >
            <svg
              class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            User Accounts
          </a>
          <a
            routerLink="/admin/tenants"
            routerLinkActive="bg-white/10 text-white shadow-lg"
            class="flex items-center gap-4 px-5 py-4 rounded-2xl text-indigo-100 hover:bg-white/5 transition-all group font-bold"
          >
            <svg
              class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Tenants / Companies
          </a>
          <a
            routerLink="/admin/content"
            routerLinkActive="bg-white/10 text-white shadow-lg"
            class="flex items-center gap-4 px-5 py-4 rounded-2xl text-indigo-100 hover:bg-white/5 transition-all group font-bold"
          >
            <svg
              class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            System Content
          </a>
        </nav>

        <div class="p-6 border-t border-white/10">
          <button
            (click)="logout()"
            class="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all font-black text-sm uppercase tracking-widest"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <header
          class="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shrink-0"
        >
          <h2 class="text-xl font-black text-gray-900 tracking-tight italic">Management Console</h2>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-xs font-black text-gray-900 leading-none">Global Admin</p>
              <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                Super User
              </p>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-600 shadow-sm overflow-hidden"
            >
              <span class="text-sm font-black text-indigo-600">AD</span>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-10">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
  }
}
