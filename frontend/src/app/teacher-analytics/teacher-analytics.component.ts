import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService } from '../api/api/teacher.service';
import { TeacherStudentProgressDto, TeacherQuizAttemptDto } from '../api/model/models';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../core/language/language.service';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button (click)="goBack()" class="text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ 'ANALYTICS.TITLE' | translate }}
            </h1>
          </div>
        </div>
      </header>

      <main class="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div class="relative z-10">
              <p class="text-sm font-medium text-gray-500 mb-1">
                {{ 'ANALYTICS.TOTAL_STUDENTS' | translate }}
              </p>
              <h3 class="text-3xl font-black text-indigo-600">{{ uniqueStudentsCount() }}</h3>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform"
            >
              <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div class="relative z-10">
              <p class="text-sm font-medium text-gray-500 mb-1">
                {{ 'ANALYTICS.AVG_PROGRESS' | translate }}
              </p>
              <h3 class="text-3xl font-black text-green-600">{{ averageProgress() }}%</h3>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform"
            >
              <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
                />
              </svg>
            </div>
          </div>

          <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group"
          >
            <div class="relative z-10">
              <p class="text-sm font-medium text-gray-500 mb-1">
                {{ 'ANALYTICS.QUIZ_PASS_RATE' | translate }}
              </p>
              <h3 class="text-3xl font-black text-orange-600">{{ quizPassRate() }}%</h3>
            </div>
            <div
              class="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-110 transition-transform"
            >
              <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div class="flex border-b">
            <button
              (click)="activeTab.set('progress')"
              [class.text-indigo-600]="activeTab() === 'progress'"
              [class.border-indigo-600]="activeTab() === 'progress'"
              class="flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-all hover:bg-gray-50"
            >
              {{ 'ANALYTICS.STUDENT_PROGRESS' | translate }}
            </button>
            <div class="w-px h-10 bg-gray-100 self-stretch my-2"></div>
            <button
              (click)="activeTab.set('attempts')"
              [class.text-indigo-600]="activeTab() === 'attempts'"
              [class.border-indigo-600]="activeTab() === 'attempts'"
              class="flex-1 py-4 px-6 text-sm font-bold border-b-2 transition-all hover:bg-gray-50"
            >
              {{ 'ANALYTICS.RECENT_ATTEMPTS' | translate }}
            </button>
          </div>

          <div class="p-6">
            @if (loading()) {
              <div class="flex justify-center items-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            } @else {
              @if (activeTab() === 'progress') {
                <div class="animate-fade-in overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.STUDENT' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.COURSE' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.PROGRESS' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.JOINED' | translate }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (p of studentProgress(); track $index) {
                        <tr class="hover:bg-gray-50/50 transition-colors group">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div
                                class="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3 uppercase"
                              >
                                {{ p.studentName?.[0] || '?' }}
                              </div>
                              <div>
                                <div
                                  class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors"
                                >
                                  {{ p.studentName }}
                                </div>
                                <div class="text-xs text-gray-500">{{ p.studentUsername }}</div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-sm font-medium text-gray-700">{{
                              p.courseTitle
                            }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center space-x-3 max-w-37.5">
                              <div class="grow bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                  class="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  [style.width.%]="$any(p.progressPercentage)"
                                ></div>
                              </div>
                              <span class="text-xs font-bold text-gray-600"
                                >{{ p.progressPercentage }}%</span
                              >
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ p.joinedAt | date: 'mediumDate' }}
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="4" class="py-10 text-center text-gray-400 italic">
                            {{ 'ANALYTICS.NO_DATA' | translate }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="animate-fade-in overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.STUDENT' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.QUIZ' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.SCORE' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.RESULT' | translate }}
                        </th>
                        <th
                          class="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {{ 'ANALYTICS.DATE' | translate }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (a of quizAttempts(); track a.id) {
                        <tr class="hover:bg-gray-50/50 transition-colors group">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span class="text-sm font-bold text-gray-900">{{ a.studentName }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-sm font-medium text-gray-700">{{ a.quizTitle }}</span>
                          </td>
                          <td class="px-6 py-4">
                            <span
                              class="text-sm font-bold"
                              [class.text-green-600]="a.isPassed"
                              [class.text-red-600]="!a.isPassed"
                            >
                              {{ $any(a.score) | number: '1.0-0' }}%
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            @if (a.isPassed) {
                              <span
                                class="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest"
                                >{{ 'ANALYTICS.PASSED' | translate }}</span
                              >
                            } @else {
                              <span
                                class="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest"
                                >{{ 'ANALYTICS.FAILED' | translate }}</span
                              >
                            }
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ a.completedAt | date: 'short' }}
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="5" class="py-10 text-center text-gray-400 italic">
                            {{ 'ANALYTICS.NO_DATA' | translate }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class TeacherAnalyticsComponent implements OnInit {
  private teacherService = inject(TeacherService);
  private router = inject(Router);
  public languageService = inject(LanguageService);

  loading = signal(true);
  activeTab = signal<'progress' | 'attempts'>('progress');
  studentProgress = signal<TeacherStudentProgressDto[]>([]);
  quizAttempts = signal<TeacherQuizAttemptDto[]>([]);

  // Derived stats
  uniqueStudentsCount = signal(0);
  averageProgress = signal(0);
  quizPassRate = signal(0);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load both datasets
    this.teacherService.apiTeacherStudentProgressGet().subscribe({
      next: (data) => {
        this.studentProgress.set(data);
        this.calculateStats();
        this.checkLoadingComplete();
      },
      error: (err) => console.error('Error loading progress:', err),
    });

    this.teacherService.apiTeacherQuizAttemptsGet().subscribe({
      next: (data) => {
        this.quizAttempts.set(data);
        this.calculateStats();
        this.checkLoadingComplete();
      },
      error: (err) => console.error('Error loading attempts:', err),
    });
  }

  private checkLoadingComplete() {
    // Basic check - in real app might use forkJoin
    this.loading.set(false);
  }

  private calculateStats() {
    const progress = this.studentProgress();
    const attempts = this.quizAttempts();

    // Unique students
    const uniqueStudents = new Set(progress.map((p) => p.studentId));
    this.uniqueStudentsCount.set(uniqueStudents.size);

    // Average progress
    if (progress.length > 0) {
      const avg =
        progress.reduce((acc, p) => acc + ((p.progressPercentage as any) || 0), 0) /
        progress.length;
      this.averageProgress.set(Math.round(avg));
    }

    // Quiz pass rate
    if (attempts.length > 0) {
      const passed = attempts.filter((a) => a.isPassed).length;
      this.quizPassRate.set(Math.round((passed / attempts.length) * 100));
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
