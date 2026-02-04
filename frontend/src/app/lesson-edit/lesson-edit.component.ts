import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonsService } from '../api/api/lessons.service';
import { CreateLessonDto, UpdateLessonDto, Lesson } from '../api/model/models';

@Component({
  selector: 'app-lesson-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="flex items-center space-x-4 mb-8">
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
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditMode() ? 'Edit Lesson' : 'Add New Lesson' }}
          </h1>
        </div>

        <!-- Form Card -->
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div class="p-8">
            @if (error()) {
              <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                <div class="flex">
                  <div class="shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-700">{{ error() }}</p>
                  </div>
                </div>
              </div>
            }

            @if (loading()) {
              <div class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            } @else {
              <form (ngSubmit)="saveLesson()" class="space-y-6">
                <div>
                  <label for="title" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Lesson Title *</label
                  >
                  <input
                    type="text"
                    id="title"
                    [ngModel]="lessonData().title"
                    (ngModelChange)="updateFormField('title', $event)"
                    name="title"
                    required
                    class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg px-4 py-3 border transition-all"
                    placeholder="Enter a descriptive title for this lesson"
                  />
                </div>

                <div>
                  <label for="content" class="block text-sm font-semibold text-gray-700 mb-1"
                    >Content</label
                  >
                  <textarea
                    id="content"
                    [ngModel]="lessonData().content"
                    (ngModelChange)="updateFormField('content', $event)"
                    name="content"
                    rows="10"
                    class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 border transition-all"
                    placeholder="Provide lesson details, instructions, or course material..."
                  ></textarea>
                </div>

                <div class="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100">
                  <button
                    type="button"
                    (click)="goBack()"
                    class="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="saving() || !lessonData().title"
                    class="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-95"
                  >
                    {{ saving() ? 'Saving...' : isEditMode() ? 'Update Lesson' : 'Create Lesson' }}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LessonEditComponent implements OnInit {
  private lessonsService = inject(LessonsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  courseId = signal<number>(0);
  lessonId = signal<number | null>(null);

  lessonData = signal({
    title: '',
    content: '',
  });

  updateFormField(field: 'title' | 'content', value: string) {
    this.lessonData.update((prev) => ({ ...prev, [field]: value }));
  }

  ngOnInit() {
    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    const lessonIdParam = this.route.snapshot.paramMap.get('lessonId');

    if (courseIdParam) {
      this.courseId.set(parseInt(courseIdParam, 10));
    }

    if (lessonIdParam) {
      this.isEditMode.set(true);
      this.lessonId.set(parseInt(lessonIdParam, 10));
      this.loadLesson(this.lessonId()!);
    }
  }

  loadLesson(id: any) {
    this.loading.set(true);
    this.lessonsService.apiLessonsIdGet(id).subscribe({
      next: (lesson) => {
        this.lessonData.set({
          title: lesson.title ?? '',
          content: lesson.content || '',
        });
        this.loading.set(false);
      },

      error: (err) => {
        this.error.set('Failed to load lesson details.');
        this.loading.set(false);
        console.error('Error loading lesson:', err);
      },
    });
  }

  saveLesson() {
    if (!this.lessonData().title) return;

    this.saving.set(true);
    this.error.set('');

    if (this.isEditMode()) {
      const updateData: UpdateLessonDto = {
        title: this.lessonData().title,
        content: this.lessonData().content || null,
      };

      this.lessonsService.apiLessonsIdPut(this.lessonId()!, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.goBack();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to update lesson.');
          console.error('Error updating lesson:', err);
        },
      });
    } else {
      const createData: CreateLessonDto = {
        title: this.lessonData().title,
        content: this.lessonData().content || null,
        courseId: this.courseId(),
      };

      this.lessonsService.apiLessonsPost(createData).subscribe({
        next: () => {
          this.saving.set(false);
          this.goBack();
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to create lesson.');
          console.error('Error creating lesson:', err);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/courses/manage']);
  }
}
