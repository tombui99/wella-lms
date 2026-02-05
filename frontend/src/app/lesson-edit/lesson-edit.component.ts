import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, finalize } from 'rxjs';
import { LessonsService } from '../api/api/lessons.service';
import { CreateLessonDto, UpdateLessonDto, Lesson } from '../api/model/models';

import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-lesson-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillEditorComponent],
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
                  <div class="rich-text-editor-container">
                    <quill-editor
                      [ngModel]="lessonData().content"
                      (ngModelChange)="updateFormField('content', $event)"
                      name="content"
                      class="block w-full"
                      placeholder="Provide lesson details, instructions, or course material..."
                      [modules]="{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          ['blockquote', 'code-block'],
                          [{ header: 1 }, { header: 2 }],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          [{ script: 'sub' }, { script: 'super' }],
                          [{ indent: '-1' }, { indent: '+1' }],
                          [{ direction: 'rtl' }],
                          [{ size: ['small', false, 'large', 'huge'] }],
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          [{ color: [] }, { background: [] }],
                          [{ font: [] }],
                          [{ align: [] }],
                          ['clean'],
                          ['link', 'image', 'video'],
                        ],
                      }"
                    ></quill-editor>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Video Upload -->
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Upload Video</label>
                    <input
                      type="file"
                      (change)="onFileSelected($event, 'video')"
                      accept="video/*"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    @if (lessonData().videoUrl || selectedVideoFile) {
                      <div
                        class="flex items-center justify-between bg-green-50/50 rounded-xl p-3 border border-green-100 mt-2"
                      >
                        <div class="flex items-center min-w-0 mr-4">
                          <svg
                            class="w-4 h-4 text-green-600 mr-2 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          <span
                            class="text-green-700 text-xs font-medium truncate"
                            [title]="
                              selectedVideoFile
                                ? selectedVideoFile.name
                                : getFileName(lessonData().videoUrl)
                            "
                          >
                            {{
                              selectedVideoFile
                                ? selectedVideoFile.name
                                : getFileName(lessonData().videoUrl)
                            }}
                          </span>
                        </div>
                        <div class="flex items-center space-x-3 shrink-0">
                          @if (lessonData().videoUrl && !selectedVideoFile) {
                            <a
                              [href]="getFullUrl(lessonData().videoUrl)"
                              target="_blank"
                              class="text-indigo-600 text-[10px] font-bold hover:underline transition-all"
                              >VIEW</a
                            >
                            <button
                              type="button"
                              (click)="removeMedia('video')"
                              class="text-red-600 text-[10px] font-bold hover:text-red-800 transition-all"
                            >
                              REMOVE
                            </button>
                          } @else if (selectedVideoFile) {
                            <button
                              type="button"
                              (click)="removeMedia('video')"
                              class="text-gray-400 hover:text-red-500 transition-all"
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
                                  stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12"
                                ></path>
                              </svg>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- PDF Upload -->
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Upload PDF</label>
                    <input
                      type="file"
                      (change)="onFileSelected($event, 'pdf')"
                      accept="application/pdf"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    @if (lessonData().pdfUrl || selectedPdfFile) {
                      <div
                        class="flex items-center justify-between bg-green-50/50 rounded-xl p-3 border border-green-100 mt-2"
                      >
                        <div class="flex items-center min-w-0 mr-4">
                          <svg
                            class="w-4 h-4 text-green-600 mr-2 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                          <span
                            class="text-green-700 text-xs font-medium truncate"
                            [title]="
                              selectedPdfFile
                                ? selectedPdfFile.name
                                : getFileName(lessonData().pdfUrl)
                            "
                          >
                            {{
                              selectedPdfFile
                                ? selectedPdfFile.name
                                : getFileName(lessonData().pdfUrl)
                            }}
                          </span>
                        </div>
                        <div class="flex items-center space-x-3 shrink-0">
                          @if (lessonData().pdfUrl && !selectedPdfFile) {
                            <a
                              [href]="getFullUrl(lessonData().pdfUrl)"
                              target="_blank"
                              class="text-indigo-600 text-[10px] font-bold hover:underline transition-all"
                              >VIEW</a
                            >
                            <button
                              type="button"
                              (click)="removeMedia('pdf')"
                              class="text-red-600 text-[10px] font-bold hover:text-red-800 transition-all"
                            >
                              REMOVE
                            </button>
                          } @else if (selectedPdfFile) {
                            <button
                              type="button"
                              (click)="removeMedia('pdf')"
                              class="text-gray-400 hover:text-red-500 transition-all"
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
                                  stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12"
                                ></path>
                              </svg>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <label
                    for="externalVideoUrl"
                    class="block text-sm font-semibold text-gray-700 mb-1"
                    >YouTube Video Link</label
                  >
                  <input
                    type="url"
                    id="externalVideoUrl"
                    [ngModel]="lessonData().externalVideoUrl"
                    (ngModelChange)="updateFormField('externalVideoUrl', $event)"
                    name="externalVideoUrl"
                    class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 border transition-all"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
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
  styles: [
    `
      :host ::ng-deep .rich-text-editor-container .ql-container {
        min-height: 200px;
        border-bottom-left-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
        font-size: 1rem;
      }
      :host ::ng-deep .rich-text-editor-container .ql-toolbar {
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0.75rem;
        background-color: #f9fafb;
      }
    `,
  ],
})
export class LessonEditComponent implements OnInit {
  private lessonsService = inject(LessonsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  courseId = signal<number>(0);
  lessonId = signal<number | null>(null);
  selectedVideoFile: File | null = null;
  selectedPdfFile: File | null = null;

  lessonData = signal({
    title: '',
    content: '',
    videoUrl: '',
    pdfUrl: '',
    externalVideoUrl: '',
  });

  updateFormField(field: string, value: string) {
    this.lessonData.update((prev: any) => ({ ...prev, [field]: value }));
  }

  onFileSelected(event: any, type: 'video' | 'pdf') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'video') {
        this.selectedVideoFile = file;
      } else {
        this.selectedPdfFile = file;
      }
    }
  }

  uploadFile(lessonId: number, file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(`http://localhost:5186/api/Lessons/${lessonId}/upload`, formData);
  }

  getFileName(url: string | null | undefined): string {
    if (!url) return '';
    const parts = url.split('/');
    const fullName = parts[parts.length - 1];
    // Check if it has the GUID_ prefix
    if (fullName.includes('_')) {
      return fullName.split('_').slice(1).join('_');
    }
    return fullName;
  }

  getFullUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return 'http://localhost:5186' + path;
  }

  removeMedia(type: 'video' | 'pdf') {
    if (type === 'video') {
      this.selectedVideoFile = null;
      this.updateFormField('videoUrl', '');
    } else {
      this.selectedPdfFile = null;
      this.updateFormField('pdfUrl', '');
    }
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
          videoUrl: lesson.videoUrl || '',
          pdfUrl: lesson.pdfUrl || '',
          externalVideoUrl: lesson.externalVideoUrl || '',
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

    const data = {
      title: this.lessonData().title,
      content: this.lessonData().content || null,
      videoUrl: this.lessonData().videoUrl || null,
      pdfUrl: this.lessonData().pdfUrl || null,
      externalVideoUrl: this.lessonData().externalVideoUrl || null,
    };

    if (this.isEditMode()) {
      this.lessonsService.apiLessonsIdPut(this.lessonId()!, data).subscribe({
        next: () => this.processUploads(this.lessonId()! as any),
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to update lesson.');
        },
      });
    } else {
      const createData: CreateLessonDto = {
        ...data,
        courseId: this.courseId(),
      };

      this.lessonsService.apiLessonsPost(createData).subscribe({
        next: (lesson: any) => this.processUploads(lesson.id),
        error: (err) => {
          this.saving.set(false);
          this.error.set('Failed to create lesson.');
        },
      });
    }
  }

  private processUploads(lessonId: number) {
    const uploads = [];
    if (this.selectedVideoFile) {
      uploads.push(this.uploadFile(lessonId, this.selectedVideoFile, 'video'));
    }
    if (this.selectedPdfFile) {
      uploads.push(this.uploadFile(lessonId, this.selectedPdfFile, 'pdf'));
    }

    if (uploads.length === 0) {
      this.saving.set(false);
      this.goBack();
      return;
    }

    forkJoin(uploads)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.goBack(),
        error: (err) => {
          this.error.set('Lesson saved, but some files failed to upload.');
          console.error('Upload error:', err);
          // Still go back or stay? Usually, if the lesson is saved, we might want to stay to let them retry or just go back.
          // Let's stay so they can see the error.
        },
      });
  }

  goBack() {
    this.router.navigate(['/courses/manage']);
  }
}
