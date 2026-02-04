import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  readonly notifications$ = this.notifications.asReadonly();
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
    const id = this.nextId++;
    this.notifications.update((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      this.notifications.update((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}
