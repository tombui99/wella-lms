import { Component, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
    >
      <div
        class="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 class="text-3xl font-bold text-white text-center mb-6">
          {{ isLogin() ? 'Welcome Back' : 'Create Account' }}
        </h2>

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-6">
          @if (!isLogin()) {
            <div>
              <label class="block text-white text-sm font-bold mb-2">Full Name</label>
              <input
                formControlName="fullName"
                type="text"
                class="w-full px-4 py-3 rounded-lg bg-white/20 border border-transparent focus:border-white focus:bg-white/30 text-white placeholder-gray-200 focus:outline-none transition"
                placeholder="John Doe"
              />
            </div>
          }

          <div>
            <label class="block text-white text-sm font-bold mb-2">Email Address</label>
            <input
              formControlName="email"
              type="email"
              class="w-full px-4 py-3 rounded-lg bg-white/20 border border-transparent focus:border-white focus:bg-white/30 text-white placeholder-gray-200 focus:outline-none transition"
              [class.border-red-500]="
                authForm.get('email')?.invalid && authForm.get('email')?.touched
              "
              placeholder="you@example.com"
            />
            @if (authForm.get('email')?.invalid && authForm.get('email')?.touched) {
              <div class="text-red-200 text-xs mt-1">Please enter a valid email address.</div>
            }
          </div>

          <div>
            <label class="block text-white text-sm font-bold mb-2">Password</label>
            <input
              formControlName="password"
              type="password"
              class="w-full px-4 py-3 rounded-lg bg-white/20 border border-transparent focus:border-white focus:bg-white/30 text-white placeholder-gray-200 focus:outline-none transition"
              [class.border-red-500]="
                authForm.get('password')?.invalid && authForm.get('password')?.touched
              "
              placeholder="********"
            />
            @if (authForm.get('password')?.invalid && authForm.get('password')?.touched) {
              <div class="text-red-200 text-xs mt-1">Password must be at least 6 characters.</div>
            }
          </div>

          @if (!isLogin()) {
            <div>
              <label class="block text-white text-sm font-bold mb-2">I am a...</label>
              <select
                formControlName="role"
                class="w-full px-4 py-3 rounded-lg bg-white/20 border border-transparent focus:border-white focus:bg-white/30 text-white focus:outline-none transition [&>option]:text-black"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading() ? 'Processing...' : isLogin() ? 'Sign In' : 'Sign Up' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            (click)="toggleMode()"
            class="text-white hover:text-gray-200 text-sm font-medium underline"
          >
            {{ isLogin() ? "Don't have an account? Sign Up" : 'Already have an account? Sign In' }}
          </button>
        </div>

        @if (errorMessage()) {
          <div
            class="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm text-center"
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

  constructor() {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: [''],
      role: ['Student'],
    });
  }

  toggleMode() {
    this.isLogin.update((v) => !v);
    this.errorMessage.set('');
    this.authForm.reset({ role: 'Student' });
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

    if (this.isLogin()) {
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
    } else {
      this.authService
        .register({
          email: val.email,
          password: val.password,
          fullName: val.fullName,
          role: val.role,
        })
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.isLogin.set(true); // Switch to login after success
            this.errorMessage.set('Account created! Please sign in.');
            this.authForm.reset({ role: 'Student' });
          },
          error: (err) => {
            console.error('Registration Error:', err);
            this.loading.set(false);
            this.errorMessage.set(
              'Registration failed. ' + (err.error?.message || err.message || 'Try again.'),
            );
          },
        });
    }
  }
}
