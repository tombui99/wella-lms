import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      @for (note of notificationService.notifications$(); track note.id) {
        <div
          class="pointer-events-auto min-w-75 max-w-md p-4 rounded-xl shadow-2xl border transform transition-all duration-300 animate-slide-in"
          [ngClass]="{
            'bg-white border-green-100 text-green-800 shadow-green-100/50': note.type === 'success',
            'bg-white border-red-100 text-red-800 shadow-red-100/50': note.type === 'error',
            'bg-white border-indigo-100 text-indigo-800 shadow-indigo-100/50': note.type === 'info',
          }"
        >
          <div class="flex items-center gap-3">
            @if (note.type === 'success') {
              <div class="bg-green-100 p-2 rounded-full text-green-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            } @else if (note.type === 'error') {
              <div class="bg-red-100 p-2 rounded-full text-red-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            } @else {
              <div class="bg-indigo-100 p-2 rounded-full text-indigo-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            }
            <p class="text-sm font-bold">{{ note.message }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
      }
    `,
  ],
})
export class NotificationToastComponent {
  notificationService = inject(NotificationService);
}
