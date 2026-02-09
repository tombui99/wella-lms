import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SchedulesService } from '../api/api/schedules.service';
import { Schedule } from '../api/model/schedule';
import { LanguageService } from '../core/language/language.service';

@Component({
  selector: 'app-teacher-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button
              (click)="router.navigate(['/dashboard'])"
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
              {{ 'SCHEDULE.MANAGEMENT_TITLE' | translate }}
            </h1>
          </div>
          <button
            (click)="openForm()"
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
            <span>{{ 'SCHEDULE.ADD_SCHEDULE' | translate }}</span>
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (error()) {
          <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-2xl">
            <p class="text-red-700 font-medium">{{ error() }}</p>
          </div>
        }

        <!-- Main Content -->
        <div
          class="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/50 border-b border-gray-100">
                  <th class="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                    {{ 'SCHEDULE.TITLE' | translate }}
                  </th>
                  <th class="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                    {{ 'SCHEDULE.DATE_TIME' | translate }}
                  </th>
                  <th class="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">
                    {{ 'SCHEDULE.LOCATION_LINK' | translate }}
                  </th>
                  <th
                    class="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right"
                  >
                    {{ 'COMMON.ACTIONS' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (item of schedules(); track item.id) {
                  <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-5">
                      <p class="font-bold text-gray-900">{{ item.title }}</p>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-gray-700">{{
                          item.startTime
                            | date
                              : ('SCHEDULE.SHORT_DATE_FORMAT' | translate)
                              : ''
                              : languageService.currentLang()
                        }}</span>
                        <span class="text-xs text-gray-400 font-medium">
                          {{
                            item.startTime | date: 'shortTime' : '' : languageService.currentLang()
                          }}
                          -
                          {{
                            item.endTime | date: 'shortTime' : '' : languageService.currentLang()
                          }}
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      @if (item.meetingUrl) {
                        <a
                          [href]="item.meetingUrl"
                          target="_blank"
                          class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path
                              d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                            />
                          </svg>
                          {{ 'SCHEDULE.ZOOM_LINK' | translate }}
                        </a>
                      } @else if (item.location) {
                        <span class="text-sm text-gray-600 font-medium">{{ item.location }}</span>
                      } @else {
                        <span class="text-xs text-gray-300 italic">{{
                          'SCHEDULE.NO_LOCATION' | translate
                        }}</span>
                      }
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex justify-end gap-2 ">
                        <button
                          (click)="editSchedule(item)"
                          class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          (click)="deleteSchedule(item.id)"
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-20 text-center">
                      <div class="flex flex-col items-center">
                        <div
                          class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4"
                        >
                          <svg
                            class="w-10 h-10 text-gray-300"
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
                        <p class="text-gray-400 font-medium">
                          {{ 'SCHEDULE.NO_SCHEDULES' | translate }}
                        </p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Form Modal -->
    @if (showForm()) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div
          class="bg-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        >
          <div class="p-8">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-2xl font-black text-gray-900">
                {{ (isEdit() ? 'SCHEDULE.EDIT_SCHEDULE' : 'SCHEDULE.NEW_SCHEDULE') | translate }}
              </h2>
              <button
                (click)="closeForm()"
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

            <form (ngSubmit)="saveSchedule()" class="space-y-6">
              <div>
                <label
                  class="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2"
                >
                  {{ 'SCHEDULE.CLASS_TITLE' | translate }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  [placeholder]="'SCHEDULE.CLASS_TITLE' | translate"
                  class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2"
                  >
                    {{ 'SCHEDULE.START_TIME' | translate }}
                  </label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="formData.startTime"
                    name="startTime"
                    required
                    class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2"
                  >
                    {{ 'SCHEDULE.END_TIME' | translate }}
                  </label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="formData.endTime"
                    name="endTime"
                    required
                    class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  class="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2"
                >
                  {{ 'SCHEDULE.LOCATION_PLATFORM' | translate }}
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.location"
                  name="location"
                  [placeholder]="'SCHEDULE.LOCATION_PLATFORM' | translate"
                  class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2"
                >
                  {{ 'SCHEDULE.ZOOM_MEETING_LINK' | translate }}
                </label>
                <input
                  type="url"
                  [(ngModel)]="formData.meetingUrl"
                  name="meetingUrl"
                  placeholder="https://zoom.us/j/..."
                  class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                />
              </div>

              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  (click)="closeForm()"
                  class="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  {{ 'COMMON.CANCEL' | translate }}
                </button>
                <button
                  type="submit"
                  [disabled]="
                    loading() || !formData.title || !formData.startTime || !formData.endTime
                  "
                  class="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                >
                  {{ (loading() ? 'SCHEDULE.SAVING' : 'SCHEDULE.SAVE_SCHEDULE') | translate }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class TeacherScheduleManagementComponent implements OnInit {
  schedulesService = inject(SchedulesService);
  router = inject(Router);
  translate = inject(TranslateService);
  languageService = inject(LanguageService);

  schedules = signal<Schedule[]>([]);
  loading = signal(false);
  showForm = signal(false);
  isEdit = signal(false);
  error = signal('');

  formData: any = {
    id: 0,
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    meetingUrl: '',
  };

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.loading.set(true);
    this.schedulesService.apiSchedulesGet().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.translate.instant('SCHEDULE.LOAD_ERROR'));
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  openForm() {
    this.isEdit.set(false);
    this.formData = {
      id: 0,
      title: '',
      startTime: this.getDefaultDateTime(0),
      endTime: this.getDefaultDateTime(1),
      location: 'Zoom',
      meetingUrl: '',
    };
    this.showForm.set(true);
  }

  editSchedule(item: Schedule) {
    this.isEdit.set(true);
    this.formData = {
      ...item,
      // Format dates for input[type="datetime-local"]
      startTime: this.formatForInput(item.startTime || ''),
      endTime: this.formatForInput(item.endTime || ''),
    };
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveSchedule() {
    this.loading.set(true);
    this.error.set('');

    const request = this.isEdit()
      ? this.schedulesService.apiSchedulesIdPut(this.formData.id, this.formData)
      : this.schedulesService.apiSchedulesPost(this.formData);

    request.subscribe({
      next: () => {
        this.loadSchedules();
        this.closeForm();
      },
      error: (err) => {
        this.error.set(this.translate.instant('SCHEDULE.SAVE_ERROR'));
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  deleteSchedule(id: any) {
    if (!id) return;
    if (!confirm(this.translate.instant('SCHEDULE.DELETE_CONFIRM'))) return;

    this.schedulesService.apiSchedulesIdDelete(id).subscribe({
      next: () => this.loadSchedules(),
      error: (err) => {
        this.error.set(this.translate.instant('SCHEDULE.DELETE_ERROR'));
        console.error(err);
      },
    });
  }

  private getDefaultDateTime(hourOffset: number): string {
    const now = new Date();
    now.setHours(now.getHours() + 1 + hourOffset, 0, 0, 0);
    return this.formatForInput(now.toISOString());
  }

  private formatForInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Adjust for timezone offset to get YYYY-MM-DDTHH:MM
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  }
}
