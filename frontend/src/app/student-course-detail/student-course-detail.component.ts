import { Component, OnInit, inject, signal, computed } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentProgressService } from '../api/api/studentProgress.service';
import { CourseProgressDto } from '../api/model/courseProgressDto';
import { LessonProgressDto } from '../api/model/lessonProgressDto';
import { NotificationService } from '../services/notification.service';

import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safe',
  standalone: true,
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector: 'app-student-course-detail',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumbs -->
        <nav class="flex mb-6 text-sm font-medium text-gray-500" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <a
                (click)="goBack()"
                class="hover:text-indigo-600 transition-colors cursor-pointer flex items-center"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Courses
              </a>
            </li>
          </ol>
        </nav>

        @if (loading()) {
          <div class="text-center py-20">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"
            ></div>
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
            <h3 class="text-lg font-bold text-red-900 mb-2">Notice</h3>
            <p class="text-red-700 mb-6 text-sm">{{ errorMessage() }}</p>
            <button
              (click)="loadProgress()"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
        } @else if (!courseProgress()) {
          <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p class="text-gray-500">Course not found.</p>
          </div>
        } @else {
          <!-- Course Header -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div class="flex-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mb-2"
                >
                  COURSE CONTENT
                </span>
                <h1 class="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                  {{ courseProgress()?.courseTitle }}
                </h1>

                <!-- Overall Progress in Header -->
                @if (courseProgress()?.isStarted) {
                  <div class="flex items-center gap-4">
                    <div class="flex-1 max-w-xs">
                      <div class="flex justify-between mb-1">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                          >Overall Completion</span
                        >
                        <span class="text-sm font-bold text-indigo-600"
                          >{{ progressPercentage() }}%</span
                        >
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-2">
                        <div
                          class="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                          [style.width.%]="progressPercentage()"
                        ></div>
                      </div>
                    </div>
                    @if (progressPercentage() === 100) {
                      <div class="bg-green-100 text-green-700 p-1.5 rounded-full">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="shrink-0">
                @if (!courseProgress()?.isStarted) {
                  <button
                    (click)="startCourse()"
                    class="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    Start Course
                  </button>
                } @else if (progressPercentage() === 100) {
                  <div class="text-center">
                    <span class="block text-green-600 font-bold mb-1">Course Completed!</span>
                    <p class="text-gray-500 text-sm">You've mastered this subject.</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Lessons Accordion -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold text-gray-800 mb-4 px-2 flex items-center">
              <svg
                class="h-5 w-5 mr-2 text-indigo-500"
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
              Lesson Plan ({{ (courseProgress()?.lessons || []).length }})
            </h2>

            @for (
              lesson of courseProgress()?.lessons || [];
              track lesson.lessonId;
              let i = $index
            ) {
              <div
                class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  class="p-5 flex items-center justify-between cursor-pointer select-none"
                  (click)="toggleLesson(lesson.lessonId)"
                >
                  <div class="flex items-center space-x-4">
                    <div
                      class="shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                      [ngClass]="
                        lesson.isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-50 text-indigo-600'
                      "
                    >
                      @if (lesson.isCompleted) {
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      } @else {
                        {{ i + 1 }}
                      }
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-900">{{ lesson.lessonTitle }}</h3>
                      <p class="text-xs text-gray-500 uppercase tracking-tighter">
                        Lesson {{ i + 1 }} • {{ lesson.isCompleted ? 'Finished' : 'Available' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    @if (lesson.isCompleted) {
                      <span
                        class="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        Complete
                      </span>
                    }
                    <svg
                      class="h-5 w-5 text-gray-400 transform transition-transform duration-200"
                      [class.rotate-180]="expandedLessonId() === lesson.lessonId"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                @if (expandedLessonId() === lesson.lessonId) {
                  <div class="p-6 bg-gray-50 border-t border-gray-100 animate-fadeIn">
                    <!-- Lesson Media Content -->
                    <div class="mt-6 space-y-6">
                      @if (lesson.content) {
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                          <div class="rich-text-content" [innerHTML]="lesson.content"></div>
                        </div>
                      }

                      @if (lesson.externalVideoUrl) {
                        <div
                          class="aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-200"
                        >
                          <iframe
                            [src]="getYouTubeEmbedUrl(lesson.externalVideoUrl) | safe"
                            class="w-full h-full"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                          ></iframe>
                        </div>
                      }

                      @if (lesson.videoUrl) {
                        <div
                          class="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 aspect-video"
                        >
                          <video controls class="w-full h-full">
                            <source [src]="getFullUrl(lesson.videoUrl)" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      }

                      @if (lesson.pdfUrl) {
                        <div
                          class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
                        >
                          <div
                            class="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between"
                          >
                            <span class="text-sm font-bold text-gray-600 flex items-center">
                              <svg
                                class="w-5 h-5 mr-2 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clip-rule="evenodd"
                                ></path>
                              </svg>
                              Course Document (PDF)
                            </span>
                            <a
                              [href]="getFullUrl(lesson.pdfUrl)"
                              target="_blank"
                              class="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider"
                              >Open in new tab</a
                            >
                          </div>
                          <div class="h-[600px] w-full">
                            <iframe
                              [src]="getFullUrl(lesson.pdfUrl) | safe"
                              class="w-full h-full"
                              frameborder="0"
                            ></iframe>
                          </div>
                        </div>
                      }

                      @if (
                        !lesson.content &&
                        !lesson.externalVideoUrl &&
                        !lesson.videoUrl &&
                        !lesson.pdfUrl
                      ) {
                        <div
                          class="bg-white p-8 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 italic"
                        >
                          <svg
                            class="w-12 h-12 mb-3 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            ></path>
                          </svg>
                          <p>This lesson is currently being prepared by the teacher.</p>
                        </div>
                      }
                    </div>

                    <div class="flex justify-end pt-8 mt-4 border-t border-gray-200">
                      @if (!lesson.isCompleted) {
                        <button
                          (click)="completeLesson(lesson.lessonId)"
                          class="flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md transition-all transform hover:scale-105 active:scale-95"
                        >
                          Mark as Completed
                          <svg
                            class="ml-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      } @else {
                        <div class="flex items-center text-green-600 font-bold text-sm">
                          <svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          Completed on {{ lesson.completedAt | date: 'mediumDate' }}
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            @if (courseProgress()?.hasQuiz) {
              <div class="mt-12">
                <h2 class="text-xl font-bold text-gray-800 mb-6 px-2 flex items-center">
                  <svg
                    class="h-5 w-5 mr-2 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Final Assessment
                </h2>

                <div
                  class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="p-8 text-center">
                    <div
                      class="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <svg
                        class="w-8 h-8 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">
                      {{ courseProgress()?.courseTitle }} Quiz
                    </h3>
                    <p class="text-gray-500 mb-8 max-w-sm mx-auto">
                      Assess your knowledge and complete the course by passing this final quiz.
                    </p>

                    @if (courseProgress()?.isQuizPassed) {
                      <div class="flex flex-col items-center">
                        <div
                          class="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold flex items-center mb-4"
                        >
                          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          Quiz Passed
                        </div>
                        <button
                          (click)="takeQuiz()"
                          class="text-indigo-600 hover:text-indigo-800 font-bold text-sm"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    } @else {
                      <button
                        (click)="takeQuiz()"
                        class="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                      >
                        Start Final Quiz
                      </button>
                    }
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
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
    `
      .rich-text-content {
        color: #374151;
        line-height: 1.6;
      }
      .rich-text-content ::ng-deep h1 {
        font-size: 2em;
        font-weight: bold;
        margin: 1em 0 0.5em;
      }
      .rich-text-content ::ng-deep h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin: 1em 0 0.5em;
      }
      .rich-text-content ::ng-deep h3 {
        font-size: 1.25em;
        font-weight: bold;
        margin: 1em 0 0.5em;
      }
      .rich-text-content ::ng-deep ul {
        list-style-type: disc;
        padding-left: 1.5em;
        margin: 1em 0;
      }
      .rich-text-content ::ng-deep ol {
        list-style-type: decimal;
        padding-left: 1.5em;
        margin: 1em 0;
      }
      .rich-text-content ::ng-deep img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1em 0;
      }
      .rich-text-content ::ng-deep blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 1em;
        color: #6b7280;
        font-style: italic;
        margin: 1em 0;
      }
      .rich-text-content ::ng-deep pre {
        background-color: #f3f4f6;
        padding: 1em;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1em 0;
      }
    `,
  ],
})
export class StudentCourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private progressService = inject(StudentProgressService);
  private notificationService = inject(NotificationService);

  courseId!: number;
  courseProgress = signal<CourseProgressDto | undefined>(undefined);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  expandedLessonId = signal<any>(null);

  progressPercentage = computed(() => {
    return (this.courseProgress()?.progressPercentage as any) ?? 0;
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.courseId = +params['courseId'];
      this.loadProgress();
    });
  }

  loadProgress() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.progressService.apiStudentProgressCourseCourseIdGet(this.courseId).subscribe({
      next: (data) => {
        this.courseProgress.set(data);
        this.loading.set(false);
        // Expand first incomplete lesson if none expanded
        if (!this.expandedLessonId() && data.lessons && data.lessons.length > 0) {
          const incomplete = data.lessons.find((l) => !l.isCompleted);
          this.expandedLessonId.set(
            incomplete ? (incomplete.lessonId as any) : (data.lessons[0].lessonId as any),
          );
        }
      },
      error: (err) => {
        console.error('Error loading progress', err);
        this.loading.set(false);
        this.errorMessage.set(
          err.status === 401
            ? 'You are not authorized to view this course. Please try logging out and in again.'
            : 'Failed to load course details. Please try again later.',
        );
      },
    });
  }

  toggleLesson(lessonId: any) {
    this.expandedLessonId.set(this.expandedLessonId() === lessonId ? null : lessonId);
  }

  getYouTubeEmbedUrl(url: string) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? 'https://www.youtube.com/embed/' + match[2] : '';
  }

  getFullUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return 'http://localhost:5186' + path; // Backend URL
  }

  startCourse() {
    this.progressService.apiStudentProgressCourseCourseIdStartPost(this.courseId).subscribe({
      next: () => {
        this.loadProgress();
        this.notificationService.success('Course has been successfully started! Happy learning!');
      },
      error: (err) => {
        console.error('Error starting course', err);
        this.notificationService.error('Failed to start course. Please try again.');
      },
    });
  }

  completeLesson(lessonId: any) {
    this.progressService.apiStudentProgressLessonLessonIdCompletePost(lessonId).subscribe({
      next: (res) => {
        // Update local state for immediate feedback
        const currentProgress = this.courseProgress();
        if (currentProgress && currentProgress.lessons) {
          const lessons = [...currentProgress.lessons];
          const lesson = lessons.find((l) => l.lessonId === lessonId);
          if (lesson) {
            lesson.isCompleted = true;
            lesson.completedAt = new Date().toISOString();
          }
          this.courseProgress.set({
            ...currentProgress,
            lessons,
            progressPercentage: (res as any).progressPercentage,
          });
        }
      },
      error: (err) => console.error('Error completing lesson', err),
    });
  }

  goBack() {
    this.router.navigate(['/student/courses']);
  }

  takeQuiz() {
    const progress = this.courseProgress();
    if (progress && progress.quizId) {
      this.router.navigate(['/student/courses', this.courseId, 'quiz', progress.quizId]);
    }
  }
}
