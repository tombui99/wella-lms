import { Component, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden"
    >
      <!-- Background Decorations -->
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"
      ></div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -mr-20 -mb-20"
      ></div>

      <!-- Language Toggle (Fixed Top) -->
      <div class="absolute top-6 right-6 z-50">
        <div
          class="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-xl"
        >
          <button
            (click)="languageService.setLanguage('en')"
            [class.bg-white]="languageService.currentLang() === 'en'"
            [class.text-indigo-600]="languageService.currentLang() === 'en'"
            [class.text-white]="languageService.currentLang() !== 'en'"
            class="px-4 py-1.5 rounded-full text-xs font-black transition-all duration-300"
          >
            EN
          </button>
          <button
            (click)="languageService.setLanguage('vi')"
            [class.bg-white]="languageService.currentLang() === 'vi'"
            [class.text-indigo-600]="languageService.currentLang() === 'vi'"
            [class.text-white]="languageService.currentLang() !== 'vi'"
            class="px-4 py-1.5 rounded-full text-xs font-black transition-all duration-300"
          >
            VI
          </button>
        </div>
      </div>

      <div
        class="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 animate-fade-in"
      >
        <div class="text-center mb-8">
          <div
            class="bg-white/20 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30 shadow-xl rotate-3"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
              />
            </svg>
          </div>
          <h2 class="text-4xl font-black text-white tracking-tight italic">
            Bifrost <span class="text-white/70">LMS</span>
          </h2>
          <p class="text-white/60 text-sm font-bold uppercase tracking-[0.2em] mt-2">
            {{ 'AUTH.WELCOME_BACK' | translate }}
          </p>
        </div>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label
              class="block text-white/80 text-xs font-black uppercase tracking-widest mb-2 px-1"
              >{{ 'AUTH.EMAIL_ADDRESS' | translate }}</label
            >
            <input
              formControlName="email"
              type="email"
              class="w-full px-5 py-4 rounded-2xl bg-white/20 border border-white/10 focus:border-white focus:bg-white/30 text-white placeholder-white/40 focus:outline-none transition-all duration-300 shadow-inner"
              [class.border-red-400/50]="
                authForm.get('email')?.invalid && authForm.get('email')?.touched
              "
              placeholder="you@example.com"
            />
            @if (authForm.get('email')?.invalid && authForm.get('email')?.touched) {
              <div class="text-red-200 text-[10px] font-bold uppercase tracking-wider mt-2 px-1">
                {{ 'AUTH.ENTER_VALID_EMAIL' | translate }}
              </div>
            }
          </div>

          <div>
            <label
              class="block text-white/80 text-xs font-black uppercase tracking-widest mb-2 px-1"
              >{{ 'AUTH.PASSWORD' | translate }}</label
            >
            <input
              formControlName="password"
              type="password"
              class="w-full px-5 py-4 rounded-2xl bg-white/20 border border-white/10 focus:border-white focus:bg-white/30 text-white placeholder-white/40 focus:outline-none transition-all duration-300 shadow-inner"
              [class.border-red-400/50]="
                authForm.get('password')?.invalid && authForm.get('password')?.touched
              "
              placeholder="********"
            />
            @if (authForm.get('password')?.invalid && authForm.get('password')?.touched) {
              <div class="text-red-200 text-[10px] font-bold uppercase tracking-wider mt-2 px-1">
                {{ 'AUTH.PASSWORD_MIN_LENGTH' | translate }}
              </div>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-white text-indigo-600 font-black py-5 rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-2xl shadow-indigo-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm mt-4"
          >
            {{ loading() ? ('AUTH.PROCESSING' | translate) : ('AUTH.SIGN_IN_BTN' | translate) }}
          </button>
        </form>

        @if (errorMessage()) {
          <div
            class="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-100 text-[11px] font-bold text-center animate-shake uppercase tracking-wider leading-relaxed"
          >
            {{ errorMessage() }}
          </div>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  authForm: FormGroup;
  isLogin = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  private fb = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  public languageService = inject(LanguageService);

  constructor() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.errorMessage.set('Please correct the errors in the form.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const val = this.authForm.value;

    this.authService.login({ email: val.email, password: val.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login Error:', err);
        this.loading.set(false);
        this.errorMessage.set(
          'Login failed. ' + (err.error?.message || 'Please check your credentials.'),
        );
      },
    });
  }
}
