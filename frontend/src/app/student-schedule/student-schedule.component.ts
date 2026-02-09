import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SchedulesService } from '../api/api/schedules.service';
import { Schedule } from '../api/model/schedule';
import { LanguageService } from '../core/language/language.service';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">
              {{ 'DASHBOARD.SCHEDULE' | translate }}
            </h1>
            <p class="text-gray-500 font-medium">{{ 'SCHEDULE.STUDENT_DESC' | translate }}</p>
          </div>

          <div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <button
              (click)="previousMonth()"
              class="p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span class="px-4 font-bold text-gray-900 min-w-[140px] text-center capitalize">
              {{ viewTitle() }}
            </span>
            <button (click)="nextMonth()" class="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <svg
                class="w-5 h-5 text-gray-600"
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
          </div>

          <button
            (click)="router.navigate(['/dashboard'])"
            class="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7 7-7"
              />
            </svg>
            {{ 'SCHEDULE.BACK_TO_DASHBOARD' | translate }}
          </button>
        </div>

        <div
          class="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          <!-- Calendar Day Headers -->
          <div class="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            @for (day of weekDays(); track day) {
              <div
                class="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                {{ day }}
              </div>
            }
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 auto-rows-[120px] md:auto-rows-[160px]">
            @for (date of calendarDays(); track date.getTime()) {
              <div
                [class.bg-gray-50]="!isSameMonth(date)"
                class="border-r border-b border-gray-100 p-2 transition-colors hover:bg-indigo-50/30 group relative"
              >
                <span
                  [class.text-indigo-600]="isToday(date)"
                  [class.bg-indigo-50]="isToday(date)"
                  [class.text-gray-400]="!isSameMonth(date)"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black mb-1"
                >
                  {{ date.getDate() }}
                </span>

                <!-- Events for this day -->
                <div class="space-y-1 overflow-y-auto max-h-[80px] md:max-h-[120px] scrollbar-hide">
                  @for (event of eventsForDay(date); track event.id) {
                    <div
                      (click)="selectEvent(event)"
                      class="px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] md:text-xs font-bold truncate cursor-pointer hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                    >
                      {{ formatTime(event.startTime || '') }} - {{ event.title }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    @if (selectedEvent()) {
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      >
        <div
          class="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
          (click)="$event.stopPropagation()"
        >
          <div class="h-32 bg-indigo-600 relative">
            <button
              (click)="selectedEvent.set(null)"
              class="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
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
            <div class="absolute -bottom-8 left-8">
              <div
                class="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white"
              >
                <svg
                  class="w-10 h-10 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="pt-12 p-8">
            <h2 class="text-2xl font-black text-gray-900 mb-2">{{ selectedEvent()?.title }}</h2>

            <div class="space-y-4 mb-8">
              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {{ 'SCHEDULE.DATE_TIME' | translate }}
                  </p>
                  <p class="font-bold text-gray-900">
                    {{
                      selectedEvent()?.startTime
                        | date
                          : ('SCHEDULE.LONG_DATE_FORMAT' | translate)
                          : ''
                          : languageService.currentLang()
                    }}
                    <span class="text-indigo-600 mx-1">•</span>
                    {{
                      selectedEvent()?.startTime
                        | date: 'shortTime' : '' : languageService.currentLang()
                    }}
                    -
                    {{
                      selectedEvent()?.endTime
                        | date: 'shortTime' : '' : languageService.currentLang()
                    }}
                  </p>
                </div>
              </div>

              @if (selectedEvent()?.location) {
                <div class="flex items-center gap-3 text-gray-600">
                  <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {{ 'SCHEDULE.LOCATION_PLATFORM' | translate }}
                    </p>
                    <p class="font-bold text-gray-900">{{ selectedEvent()?.location }}</p>
                  </div>
                </div>
              }
            </div>

            @if (selectedEvent()?.meetingUrl) {
              <a
                [href]="selectedEvent()?.meetingUrl"
                target="_blank"
                class="w-full bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                  />
                </svg>
                {{ 'SCHEDULE.JOIN_ZOOM' | translate }}
              </a>
            } @else {
              <button
                disabled
                class="w-full bg-gray-100 text-gray-400 font-bold py-4 px-6 rounded-2xl cursor-not-allowed"
              >
                {{ 'SCHEDULE.NO_MEETING_LINK' | translate }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class StudentScheduleComponent implements OnInit {
  schedulesService = inject(SchedulesService);
  router = inject(Router);
  public languageService = inject(LanguageService);

  viewDate = signal<Date>(new Date());
  events = signal<Schedule[]>([]);
  selectedEvent = signal<Schedule | null>(null);

  weekDays = computed(() => {
    const lang = this.languageService.currentLang();
    const baseDate = new Date(2021, 0, 3); // A Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short' });
    });
  });

  viewTitle = computed(() => {
    const lang = this.languageService.currentLang();
    return this.viewDate().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  calendarDays = computed(() => {
    const date = this.viewDate();
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const days: Date[] = [];

    // Fill previous month days
    const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0);
    for (let i = start.getDay(); i > 0; i--) {
      days.push(
        new Date(
          prevMonthEnd.getFullYear(),
          prevMonthEnd.getMonth(),
          prevMonthEnd.getDate() - i + 1,
        ),
      );
    }

    // Fill current month days
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }

    // Fill next month days
    const remaining = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(date.getFullYear(), date.getMonth() + 1, i));
    }

    return days;
  });

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.schedulesService.apiSchedulesGet().subscribe({
      next: (data) => {
        this.events.set(data);
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
      },
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.viewDate().getMonth();
  }

  eventsForDay(date: Date): Schedule[] {
    return this.events().filter((event) => {
      const eventDate = new Date(event.startTime!);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }

  formatTime(isoString: string): string {
    const lang = this.languageService.currentLang();
    return new Date(isoString).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  previousMonth() {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  selectEvent(event: Schedule) {
    this.selectedEvent.set(event);
  }
}
