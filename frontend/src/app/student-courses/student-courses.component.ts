import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentProgressService } from '../api/api/studentProgress.service';
import { CourseProgressDto } from '../api/model/courseProgressDto';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Your Courses</h1>
          <button
            (click)="goBack()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        @if (loading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        } @else if (errorMessage()) {
          <div
            class="max-w-md mx-auto text-center py-12 px-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm"
          >
            <div
              class="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-red-900 mb-2">Service Unavailable</h3>
            <p class="text-red-700 mb-6 text-sm">{{ errorMessage() }}</p>
            <button
              (click)="loadCourses()"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
        } @else if (courses().length === 0) {
          <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
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
            <h3 class="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p class="mt-1 text-sm text-gray-500">Wait for your teacher to assign some courses.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (course of courses(); track course.courseId) {
              <div
                class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer transform hover:-translate-y-1"
                (click)="viewCourse(course.courseId!)"
              >
                <!-- Course Card Image/Header -->
                <div
                  class="h-48 bg-linear-to-br from-indigo-500 to-purple-600 relative overflow-hidden"
                >
                  <div
                    class="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity"
                  ></div>
                  <div class="absolute top-4 right-4">
                    @if (getProgress(course) === 100) {
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm border border-green-200"
                      >
                        <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Completed
                      </span>
                    } @else if (course.isStarted) {
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200"
                      >
                        In Progress
                      </span>
                    } @else {
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 shadow-sm border border-gray-200"
                      >
                        Not Started
                      </span>
                    }
                  </div>
                  <div class="absolute bottom-4 left-4 text-white">
                    <p class="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                      Course
                    </p>
                    <h3 class="text-xl font-bold leading-tight">{{ course.courseTitle }}</h3>
                  </div>
                </div>

                <!-- Course Card Content -->
                <div class="p-6 flex flex-col grow">
                  <div class="mt-auto">
                    <!-- Progress Bar -->
                    <div class="mb-5">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-gray-500 uppercase">Progress</span>
                        <span class="text-sm font-bold text-indigo-600"
                          >{{ getProgress(course) }}%</span
                        >
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          class="bg-indigo-600 h-full transition-all duration-700 ease-out"
                          [style.width.%]="getProgress(course)"
                        ></div>
                      </div>
                    </div>

                    <button
                      class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group-hover:scale-[1.02]"
                    >
                      @if (!course.isStarted) {
                        Start Learning
                      } @else if (getProgress(course) === 100) {
                        Review Course
                      } @else {
                        Continue Learning
                      }
                      <svg
                        class="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class StudentCoursesComponent implements OnInit {
  private progressService = inject(StudentProgressService);
  private router = inject(Router);

  courses = signal<CourseProgressDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.progressService.apiStudentProgressCoursesGet().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading courses', err);
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'You are not authorized to view this page. Please try logging out and in again.'
            : 'Failed to load courses. Please check your connection and try again.',
        );
      },
    });
  }

  getProgress(course: CourseProgressDto): number {
    return (course.progressPercentage as any) ?? 0;
  }

  viewCourse(courseId: any) {
    this.router.navigate(['/student/courses', courseId as any]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
