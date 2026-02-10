import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../api/api/courses.service';
import { LessonsService } from '../api/api/lessons.service';
import { Course, CreateCourseDto, UpdateCourseDto, Lesson } from '../api/model/models';

interface CourseFormData {
  title: string;
  description: string;
  imageUrl: string;
}

import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../core/language/language.service';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button
              (click)="goBack()"
              class="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 class="text-2xl font-black text-gray-900 tracking-tight italic">
              {{ 'COMMON.COURSE_MANAGEMENT' | translate }}
            </h1>
          </div>
          <button
            (click)="openCreateModal()"
            class="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2 font-bold active:scale-95"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>{{ 'COMMON.CREATE_COURSE' | translate }}</span>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {{ error() }}
          </div>
        }

        <!-- Empty State -->
        @if (!loading() && courses().length === 0) {
          <div class="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
            <div
              class="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <svg
                class="h-10 w-10 text-gray-300"
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
            <h3 class="text-xl font-bold text-gray-900">{{ 'COMMON.NO_COURSES' | translate }}</h3>
            <p class="mt-2 text-gray-500 font-medium">{{ 'COMMON.GET_STARTED' | translate }}</p>
          </div>
        }

        <!-- Courses Table -->
        @if (!loading() && courses().length > 0) {
          <div
            class="bg-white shadow-xl shadow-gray-100 rounded-[2.5rem] overflow-hidden border border-gray-100"
          >
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50/50">
                <tr>
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                  >
                    {{ 'COMMON.COURSES' | translate }}
                  </th>
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                  >
                    {{ 'COMMON.DESCRIPTION' | translate }}
                  </th>
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                  >
                    {{ 'COMMON.STATUS' | translate }}
                  </th>
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                  >
                    {{ 'COMMON.CREATED' | translate }}
                  </th>
                  <th
                    class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
                  >
                    {{ 'COMMON.ACTIONS' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (course of courses(); track course.id) {
                  <tr class="hover:bg-gray-50 group">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <button
                          (click)="toggleAccordion(course.id!)"
                          class="mr-3 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <svg
                            class="w-5 h-5 transform transition-transform"
                            [class.rotate-90]="isExpanded(course.id!)"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        @if (course.imageUrl) {
                          <img
                            [src]="course.imageUrl"
                            alt=""
                            class="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        } @else {
                          <div
                            class="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3"
                          >
                            <svg
                              class="h-6 w-6 text-indigo-600"
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
                        <div class="text-sm font-medium text-gray-900">{{ course.title }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-500 max-w-xs truncate">
                        {{ course.description || ('COMMON.NO_DESCRIPTION' | translate) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center space-x-3">
                        <button
                          type="button"
                          (click)="toggleApproval(course)"
                          class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                          [class.bg-indigo-600]="course.isApproved"
                          [class.bg-gray-200]="!course.isApproved"
                          [title]="course.isApproved ? 'Unapprove' : 'Approve'"
                        >
                          <span
                            class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            [class.translate-x-4]="course.isApproved"
                            [class.translate-x-0]="!course.isApproved"
                          ></span>
                        </button>
                        @if (course.isApproved) {
                          <span
                            class="text-[10px] font-bold text-green-600 uppercase tracking-wider"
                          >
                            {{ 'COMMON.APPROVED' | translate }}
                          </span>
                        } @else {
                          <span
                            class="text-[10px] font-bold text-amber-600 uppercase tracking-wider"
                          >
                            {{ 'COMMON.DRAFT' | translate }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ course.createdAt | date: 'short' }}
                    </td>
                    <td class="px-8 py-5 text-right whitespace-nowrap text-sm font-bold">
                      <button
                        (click)="openEditModal(course)"
                        class="text-indigo-600 hover:text-indigo-900 mr-6 transition-colors"
                      >
                        {{ 'COMMON.EDIT' | translate }}
                      </button>
                      <button
                        (click)="openDeleteModal(course)"
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        {{ 'COMMON.DELETE' | translate }}
                      </button>
                    </td>
                  </tr>
                  <!-- Lessons Accordion -->
                  @if (isExpanded(course.id!)) {
                    <tr>
                      <td colspan="5" class="px-12 py-4 bg-gray-50/50">
                        <div class="flex justify-between items-center mb-6">
                          <h4 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                            {{ 'COMMON.LESSONS' | translate }} ({{ course.lessons?.length || 0 }})
                          </h4>
                          <button
                            (click)="addLesson(course.id!)"
                            class="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span class="uppercase tracking-widest">{{
                              'COMMON.ADD_LESSON' | translate
                            }}</span>
                          </button>
                        </div>

                        @if (course.lessons && course.lessons.length > 0) {
                          <div class="space-y-2">
                            @for (lesson of course.lessons; track lesson.id) {
                              <div
                                class="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-indigo-200 transition-all"
                              >
                                <div class="flex items-center space-x-3">
                                  <div
                                    class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold"
                                  >
                                    {{ $index + 1 }}
                                  </div>
                                  <span class="text-sm font-medium text-gray-900">{{
                                    lesson.title
                                  }}</span>
                                </div>
                                <div class="flex items-center space-x-4">
                                  <button
                                    (click)="editLesson(course.id!, lesson.id!)"
                                    class="text-sm font-bold text-indigo-600 hover:text-indigo-900 transition-colors"
                                  >
                                    {{ 'COMMON.EDIT' | translate }}
                                  </button>
                                  <button
                                    (click)="openDeleteLessonModal(lesson)"
                                    class="text-sm font-bold text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    {{ 'COMMON.DELETE' | translate }}
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        } @else {
                          <p class="text-sm text-gray-500 italic">
                            {{ 'COMMON.NO_LESSONS' | translate }}
                          </p>
                        }

                        <div class="mt-8 pt-8 border-t border-gray-100">
                          <div class="flex justify-between items-center">
                            <div>
                              <h4
                                class="text-xs font-black text-gray-400 uppercase tracking-[0.2em]"
                              >
                                {{ 'COMMON.QUIZ' | translate }}
                              </h4>
                              <p class="text-sm font-bold text-gray-900 mt-1">
                                {{ 'COMMON.FINAL_ASSESSMENT' | translate }}
                              </p>
                            </div>
                            <button
                              (click)="manageQuiz(course.id!)"
                              class="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center space-x-3 shadow-lg shadow-indigo-100 uppercase tracking-widest active:scale-95"
                            >
                              <svg
                                class="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2.5"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                              </svg>
                              <span>{{ 'COMMON.MANAGE_QUIZ' | translate }}</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        }
      </main>
      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div
          class="fixed inset-0 bg-gray-900/40 backdrop-blur-md overflow-y-auto h-full w-full z-50 transition-all duration-300 flex items-center justify-center p-4"
          (click)="closeModal()"
        >
          <div
            class="relative mx-auto p-8 border border-white/20 w-full max-w-md shadow-2xl rounded-[2.5rem] bg-white animate-scale-up"
            (click)="$event.stopPropagation()"
          >
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-2xl font-black text-gray-900 tracking-tight italic">
                {{ (editingCourse() ? 'COMMON.EDIT_COURSE' : 'COMMON.CREATE_COURSE') | translate }}
              </h3>
              <button
                (click)="closeModal()"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveCourse()">
              <div class="space-y-4">
                <div>
                  <label for="title" class="block text-sm font-semibold text-gray-700"
                    >{{ 'COMMON.TITLE' | translate }} *</label
                  >
                  <input
                    type="text"
                    id="title"
                    [ngModel]="formData().title"
                    (ngModelChange)="updateFormField('title', $event)"
                    name="title"
                    required
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border transition-all"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-semibold text-gray-700">{{
                    'COMMON.DESCRIPTION' | translate
                  }}</label>
                  <textarea
                    id="description"
                    [ngModel]="formData().description"
                    (ngModelChange)="updateFormField('description', $event)"
                    name="description"
                    rows="3"
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border transition-all"
                    placeholder="Enter course description"
                  ></textarea>
                </div>

                <div>
                  <label for="imageUrl" class="block text-sm font-semibold text-gray-700"
                    >Image URL</label
                  >
                  <input
                    type="url"
                    id="imageUrl"
                    [ngModel]="formData().imageUrl"
                    (ngModelChange)="updateFormField('imageUrl', $event)"
                    name="imageUrl"
                    class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div class="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-6 py-3 text-xs font-black text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all uppercase tracking-widest border border-gray-100"
                >
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
                <button
                  type="submit"
                  [disabled]="saving() || !formData().title"
                  class="px-8 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest active:scale-95"
                >
                  {{
                    saving()
                      ? ('COMMON.SAVING' | translate)
                      : ((editingCourse() ? 'COMMON.EDIT' : 'COMMON.CREATE_COURSE') | translate)
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 transition-all duration-300"
          (click)="closeDeleteModal()"
        >
          <div
            class="relative top-20 mx-auto p-6 border w-full max-w-sm shadow-2xl rounded-2xl bg-white"
            (click)="$event.stopPropagation()"
          >
            <div class="text-center">
              <div
                class="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 mb-6 shadow-sm border border-red-100"
              >
                <svg
                  class="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {{ 'COMMON.DELETE_COURSE' | translate }}?
              </h3>
              {{ 'COMMON.ARE_YOU_SURE_DELETE' | translate }}
              <span class="text-indigo-600">"{{ courseToDelete()?.title }}"</span>?
              {{ 'COMMON.PERMANENT_ACTION' | translate }}
              <div class="flex flex-col space-y-3">
                <button
                  (click)="confirmDelete()"
                  [disabled]="deleting()"
                  class="w-full px-6 py-4 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl disabled:opacity-50 transition-all shadow-xl shadow-red-100 active:scale-95 uppercase tracking-widest"
                >
                  {{
                    deleting()
                      ? ('COMMON.SAVING' | translate)
                      : ('COMMON.DELETE_COURSE' | translate)
                  }}
                </button>
                <button
                  (click)="closeDeleteModal()"
                  class="w-full px-6 py-4 text-xs font-black text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100 uppercase tracking-widest"
                >
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Delete Lesson Confirmation Modal -->
      @if (showDeleteLessonModal()) {
        <div
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 transition-all duration-300"
          (click)="closeDeleteLessonModal()"
        >
          <div
            class="relative top-20 mx-auto p-6 border w-full max-w-sm shadow-2xl rounded-2xl bg-white"
            (click)="$event.stopPropagation()"
          >
            <div class="text-center">
              <div
                class="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 mb-6 shadow-sm border border-red-100"
              >
                <svg
                  class="h-10 w-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                {{ 'COMMON.DELETE_LESSON' | translate }}?
              </h3>
              {{ 'COMMON.ARE_YOU_SURE_DELETE' | translate }}
              <span class="text-indigo-600">"{{ lessonToDelete()?.title }}"</span>?
              <div class="flex flex-col space-y-3">
                <button
                  (click)="confirmDeleteLesson()"
                  [disabled]="deletingLesson()"
                  class="w-full px-6 py-4 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-2xl disabled:opacity-50 transition-all shadow-xl shadow-red-100 active:scale-95 uppercase tracking-widest"
                >
                  {{
                    deletingLesson()
                      ? ('COMMON.SAVING' | translate)
                      : ('COMMON.YES_DELETE' | translate)
                  }}
                </button>
                <button
                  (click)="closeDeleteLessonModal()"
                  class="w-full px-6 py-4 text-xs font-black text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100 uppercase tracking-widest"
                >
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CourseManagementComponent implements OnInit {
  private coursesService = inject(CoursesService);
  private lessonsService = inject(LessonsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public languageService = inject(LanguageService);

  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal('');
  expandedCourses = signal<Set<number>>(new Set());

  // Modal state
  showModal = signal(false);
  showDeleteModal = signal(false);
  showDeleteLessonModal = signal(false);
  saving = signal(false);
  deleting = signal(false);
  deletingLesson = signal(false);
  editingCourse = signal<Course | null>(null);
  courseToDelete = signal<Course | null>(null);
  lessonToDelete = signal<Lesson | null>(null);

  formData = signal<CourseFormData>({
    title: '',
    description: '',
    imageUrl: '',
  });

  toggleApproval(course: Course) {
    if (!course.id) return;
    const newStatus = !course.isApproved;

    const updateData: UpdateCourseDto = {
      title: course.title!,
      description: course.description || null,
      imageUrl: course.imageUrl || null,
      isApproved: newStatus,
    };

    this.coursesService.apiCoursesIdPut(course.id, updateData).subscribe({
      next: () => {
        this.loadCourses();
      },
      error: (err) => {
        this.error.set('Failed to update approval status.');
        console.error('Error toggling approval:', err);
      },
    });
  }

  ngOnInit() {
    this.loadCourses();
    const expandedId = this.route.snapshot.queryParamMap.get('expanded');
    if (expandedId) {
      this.expandedCourses.update((set) => {
        const newSet = new Set(set);
        newSet.add(parseInt(expandedId, 10));
        return newSet;
      });
    }
  }

  loadCourses() {
    this.loading.set(true);
    this.error.set('');

    this.coursesService.apiCoursesGet().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load courses. Please try again.');
        this.loading.set(false);
        console.error('Error loading courses:', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  openCreateModal() {
    this.editingCourse.set(null);
    this.formData.set({ title: '', description: '', imageUrl: '' });
    this.showModal.set(true);
  }

  openEditModal(course: Course) {
    this.editingCourse.set(course);
    this.formData.set({
      title: course.title || '',
      description: course.description || '',
      imageUrl: course.imageUrl || '',
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCourse.set(null);
  }

  openDeleteModal(course: Course) {
    this.courseToDelete.set(course);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.courseToDelete.set(null);
  }

  // Accordion Logic
  toggleAccordion(courseId: any) {
    this.expandedCourses.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }

  isExpanded(courseId: any): boolean {
    return this.expandedCourses().has(courseId);
  }

  // Lesson Management
  addLesson(courseId: any) {
    this.router.navigate(['/courses', courseId, 'lessons', 'add']);
  }

  editLesson(courseId: any, lessonId: any) {
    this.router.navigate(['/courses', courseId, 'lessons', lessonId, 'edit']);
  }

  manageQuiz(courseId: any) {
    this.router.navigate(['/courses', courseId, 'quiz', 'manage']);
  }

  openDeleteLessonModal(lesson: Lesson) {
    this.lessonToDelete.set(lesson);
    this.showDeleteLessonModal.set(true);
  }

  closeDeleteLessonModal() {
    this.showDeleteLessonModal.set(false);
    this.lessonToDelete.set(null);
  }

  confirmDeleteLesson() {
    const lesson = this.lessonToDelete();
    if (!lesson) return;

    this.deletingLesson.set(true);
    this.lessonsService.apiLessonsIdDelete(lesson.id!).subscribe({
      next: () => {
        this.deletingLesson.set(false);
        this.closeDeleteLessonModal();
        this.loadCourses(); // Refresh to get updated lessons list in courses
      },
      error: (err) => {
        this.deletingLesson.set(false);
        this.error.set('Failed to delete lesson.');
        console.error('Error deleting lesson:', err);
      },
    });
  }

  updateFormField(field: keyof CourseFormData, value: any) {
    this.formData.update((prev) => ({ ...prev, [field]: value }));
  }

  saveCourse() {
    const currentData = this.formData();
    const editing = this.editingCourse();

    if (!currentData.title) return;

    this.saving.set(true);

    if (editing) {
      // Update existing course
      const updateData: UpdateCourseDto = {
        title: currentData.title,
        description: currentData.description || null,
        imageUrl: currentData.imageUrl || null,
        isApproved: editing.isApproved || false, // Keep current status
      };

      this.coursesService.apiCoursesIdPut(editing.id!, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadCourses();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to update course. Please try again.');
          console.error('Error updating course:', err);
        },
      });
    } else {
      // Create new course
      const createData: CreateCourseDto = {
        title: currentData.title,
        description: currentData.description || null,
        imageUrl: currentData.imageUrl || null,
        isApproved: false, // Default to false for new courses
      };

      this.coursesService.apiCoursesPost(createData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadCourses();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to create course. Please try again.');
          console.error('Error creating course:', err);
        },
      });
    }
  }

  confirmDelete() {
    const deletingCourse = this.courseToDelete();
    if (!deletingCourse) return;

    this.deleting.set(true);

    this.coursesService.apiCoursesIdDelete(deletingCourse.id!).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeDeleteModal();
        this.loadCourses();
      },
      error: (err) => {
        this.deleting.set(false);
        this.error.set('Failed to delete course. Please try again.');
        console.error('Error deleting course:', err);
      },
    });
  }
}
