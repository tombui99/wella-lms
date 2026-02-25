import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { StudentProgressService } from '../api/api/studentProgress.service';
import { LanguageService } from '../core/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="grow animate-fade-in">
      <!-- Teacher Section -->
      @if (authService.userRole() === 'Teacher') {
        <div class="mb-8">
          <h2
            class="text-xl font-bold text-gray-800 mb-4 flex items-center uppercase tracking-wide"
          >
            <span
              class="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-3 px-3 py-1 rounded-full shadow-sm"
              >{{ 'COMMON.MANAGEMENT' | translate }}</span
            >
            {{ 'COMMON.COURSES' | translate }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Course Management Widget -->
            <div
              (click)="navigateToCourseManagement()"
              class="bg-white overflow-hidden shadow-lg shadow-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-yellow-400 group active:scale-95"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div
                    class="shrink-0 bg-yellow-50 rounded-2xl p-4 group-hover:bg-yellow-100 transition-colors"
                  >
                    <svg
                      class="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
                      />
                    </svg>
                  </div>
                  <div class="ml-5">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {{ 'COMMON.COURSES' | translate }}
                    </p>
                    <p class="text-lg font-black text-gray-900 leading-tight">
                      {{ 'COMMON.MANAGEMENT' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule Management Widget (New) -->
            <div
              (click)="navigateToSchedule()"
              class="bg-white overflow-hidden shadow-lg shadow-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-yellow-400 group active:scale-95"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div
                    class="shrink-0 bg-yellow-50 rounded-2xl p-4 group-hover:bg-yellow-100 transition-colors"
                  >
                    <svg
                      class="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div class="ml-5">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {{ 'DASHBOARD.SCHEDULE' | translate }}
                    </p>
                    <p class="text-lg font-black text-gray-900 leading-tight">
                      {{ 'COMMON.MANAGEMENT' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Student Analytics Widget -->
            <div
              (click)="navigateToAnalytics()"
              class="bg-white overflow-hidden shadow-lg shadow-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-yellow-400 group active:scale-95"
            >
              <div class="p-6">
                <div class="flex items-center">
                  <div
                    class="shrink-0 bg-yellow-50 rounded-2xl p-4 group-hover:bg-yellow-100 transition-colors"
                  >
                    <svg
                      class="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div class="ml-5">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                      {{ 'COMMON.ANALYTICS' | translate }}
                    </p>
                    <p class="text-lg font-black text-gray-900 leading-tight">
                      {{ 'DASHBOARD.STUDENT_PROGRESS' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Admin Panel Widget -->
      @if (authService.userRole() === 'Admin') {
        <div
          (click)="navigateToAdmin()"
          class="max-w-sm bg-indigo-900 overflow-hidden shadow-2xl shadow-indigo-200 rounded-3xl hover:shadow-indigo-300 transition-all duration-300 cursor-pointer border-t-4 border-indigo-400 group active:scale-95 translate-y-0 hover:-translate-y-2"
        >
          <div class="p-6 relative">
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"
            ></div>
            <div class="flex items-center relative z-10">
              <div class="shrink-0 bg-indigo-600 rounded-2xl p-4 shadow-lg ring-1 ring-white/20">
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div class="ml-5">
                <p class="text-xs font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">
                  Control Panel
                </p>
                <p class="text-lg font-black text-white leading-tight italic tracking-tight">
                  System Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Student Progress Summary (New) -->
      @if (authService.userRole() === 'Student' && overallProgress() !== null) {
        <div class="mb-10 animate-fade-in">
          <div
            class="bg-white rounded-3xl p-8 shadow-xl border border-indigo-50/50 relative overflow-hidden"
          >
            <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <!-- Circular Progress -->
              <div class="relative w-32 h-32 shrink-0">
                <svg class="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    class="text-gray-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    [attr.stroke-dasharray]="364.4"
                    [attr.stroke-dashoffset]="364.4 - (364.4 * overallProgress()!) / 100"
                    class="text-indigo-600 transition-all duration-1000 ease-out"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-3xl font-black text-indigo-600">{{ overallProgress() }}%</span>
                </div>
              </div>

              <div class="grow text-center md:text-left">
                <h3 class="text-3xl font-black text-gray-900 mb-2 leading-tight">
                  {{ 'DASHBOARD.LEARNING_JOURNEY' | translate }}
                </h3>
                <p class="text-gray-500 mb-6 max-w-md text-lg leading-relaxed">
                  {{ 'DASHBOARD.COMPLETED_TEXT' | translate }}
                  <span class="bg-indigo-600 text-white px-2 rounded-lg font-bold"
                    >{{ overallProgress() }}%</span
                  >
                  {{ 'DASHBOARD.MATERIALS_TEXT' | translate }}
                </p>
                <div class="flex flex-wrap justify-center md:justify-start gap-4">
                  <div
                    class="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 shadow-sm transition-all hover:bg-white"
                  >
                    <span
                      class="block text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 leading-none"
                      >{{ 'DASHBOARD.STATUS' | translate }}</span
                    >
                    <span class="text-indigo-700 font-black text-sm uppercase tracking-wider">
                      @if (overallProgress()! >= 100) {
                        {{ 'DASHBOARD.MASTERED' | translate }}
                      } @else if (overallProgress()! >= 50) {
                        {{ 'DASHBOARD.ON_TRACK' | translate }}
                      } @else {
                        {{ 'DASHBOARD.JUST_STARTING' | translate }}
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div class="hidden lg:block">
                <button
                  (click)="navigateToStudentCourses()"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-3xl shadow-2xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 text-lg"
                >
                  {{ 'DASHBOARD.CONTINUE_LEARNING' | translate }}
                </button>
              </div>
            </div>

            <!-- Decorative Background Element -->
            <div
              class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50"
            ></div>
          </div>
        </div>
      }

      <!-- Student Section -->
      @if (authService.userRole() === 'Student') {
        <h2 class="text-2xl font-black text-gray-900 mb-6 tracking-tight">
          {{ 'DASHBOARD.OVERALL_PROGRESS' | translate }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Widget: Schedule -->
          <div
            (click)="navigateToSchedule()"
            class="bg-white group overflow-hidden shadow-lg shadow-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 active:scale-95"
          >
            <div class="p-6">
              <div
                class="flex items-center justify-center mb-4 bg-indigo-50 w-16 h-16 rounded-2xl mx-auto group-hover:bg-indigo-100 transition-colors"
              >
                <svg
                  class="h-8 w-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div class="text-center">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ 'DASHBOARD.SCHEDULE' | translate }}
                </h3>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {{ 'DASHBOARD.VIEW_CLASSES' | translate }}
                </p>
              </div>
            </div>
          </div>

          <!-- Widget: Courses -->
          <div
            (click)="navigateToStudentCourses()"
            class="bg-white group overflow-hidden shadow-lg shadow-gray-100 rounded-3xl hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 active:scale-95"
          >
            <div class="p-6">
              <div
                class="flex items-center justify-center mb-4 bg-indigo-50 w-16 h-16 rounded-2xl mx-auto group-hover:bg-indigo-100 transition-colors"
              >
                <svg
                  class="h-8 w-8 text-indigo-600"
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
              <div class="text-center">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ 'COMMON.COURSES' | translate }}
                </h3>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {{ 'DASHBOARD.ACTIVE_COURSES' | translate }}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthenticationService);
  studentProgressService = inject(StudentProgressService);
  public languageService = inject(LanguageService);

  overallProgress = signal<number | null>(null);

  ngOnInit() {
    if (this.authService.userRole() === 'Student') {
      this.loadOverallProgress();
    }
  }

  loadOverallProgress() {
    this.studentProgressService.apiStudentProgressCoursesGet().subscribe({
      next: (courses) => {
        if (courses.length > 0) {
          const total = courses.reduce((acc, course) => {
            const progress = course.progressPercentage as any as number;
            return acc + (progress || 0);
          }, 0);
          this.overallProgress.set(Math.round(total / courses.length));
        } else {
          this.overallProgress.set(0);
        }
      },
      error: (err) => {
        console.error('Error loading overall progress:', err);
      },
    });
  }

  navigateToCourseManagement() {
    this.router.navigate(['/courses/manage']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/teacher/analytics']);
  }

  navigateToStudentCourses() {
    this.router.navigate(['/student/courses']);
  }

  navigateToSchedule() {
    if (this.authService.userRole() === 'Teacher' || this.authService.userRole() === 'Admin') {
      this.router.navigate(['/teacher/schedules']);
    } else {
      this.router.navigate(['/student/schedule']);
    }
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }

  private router = inject(Router);
}
