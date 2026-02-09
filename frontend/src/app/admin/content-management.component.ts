import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../api/api/admin.service';
import { ContentDisplayDto, Tenant } from '../api/model/models';

@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex justify-between items-end">
        <div>
          <h3 class="text-3xl font-black text-gray-900 tracking-tight italic">Course Management</h3>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            Assign and share courses across multiple tenants
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (item of content(); track item.id) {
          <div
            class="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"
            ></div>

            <div class="relative flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-black text-gray-900 italic tracking-tight truncate">
                  {{ item.title }}
                </p>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  ID: {{ item.id }}
                </p>
              </div>
            </div>

            <div class="mt-8 space-y-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Primary Owner
                </p>
                <span
                  class="px-4 py-2 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-600/20"
                >
                  {{ item.tenantId }}
                </span>
              </div>

              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Shared With
                </p>
                <div class="flex flex-wrap gap-2">
                  @if (item.sharedTenantIds && item.sharedTenantIds.length > 0) {
                    @for (tid of item.sharedTenantIds; track tid) {
                      <span
                        class="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest"
                      >
                        {{ tid }}
                      </span>
                    }
                  } @else {
                    <span class="text-[10px] font-bold text-gray-300 italic">No other tenants</span>
                  }
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-50">
              <button
                (click)="onOpenEditModal(item)"
                class="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-[0.98] group"
              >
                <span class="text-xs font-black uppercase tracking-widest">Manage Access</span>
                <svg
                  class="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Management Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="absolute inset-0 bg-indigo-950/40 backdrop-blur-md"
            (click)="showModal.set(false)"
          ></div>

          <div
            class="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 animate-slide-up"
          >
            <div class="bg-indigo-900 p-10 text-white relative">
              <div
                class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"
              ></div>
              <h4 class="text-4xl font-black italic tracking-tight relative leading-none">
                Course Access
              </h4>
              <p class="text-sm font-bold text-indigo-300 uppercase tracking-widest mt-2 relative">
                Configure Global Availability
              </p>
            </div>

            <div class="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <!-- Item Summary -->
              <div
                class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-center gap-6"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0"
                >
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 4.168 6.253v13C4.168 19.333 5.477 19 7.5 19s3.332.333 4.168.618m4.332 0c.835-.285 1.668-.618 4.168-.618 1.667 0 3.253.477 3.253.618v-13C19.832 5.477 18.246 5 16.5 5c-1.668 0-3.253.477-4.168.618"
                    />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                    Editing Course Access
                  </p>
                  <h5 class="text-2xl font-black text-indigo-900 italic leading-tight truncate">
                    {{ selectedItem()?.title }}
                  </h5>
                </div>
              </div>

              <!-- Primary Owner Selection -->
              <div>
                <label
                  class="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-4"
                >
                  Primary Owner <span class="text-indigo-600">(Strict Isolation)</span>
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (tenant of tenants(); track tenant.id) {
                    <button
                      (click)="updatePrimaryTenant(tenant.id!)"
                      class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all"
                      [ngClass]="
                        tenant.id === selectedItem()?.tenantId
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10'
                          : 'border-gray-50 hover:border-indigo-200 bg-gray-50/50'
                      "
                    >
                      <div class="text-left">
                        <p
                          class="font-black text-xs italic tracking-tight"
                          [ngClass]="
                            tenant.id === selectedItem()?.tenantId
                              ? 'text-indigo-900'
                              : 'text-gray-900'
                          "
                        >
                          {{ tenant.name }}
                        </p>
                      </div>
                      @if (tenant.id === selectedItem()?.tenantId) {
                        <div
                          class="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Shared Tenants Multi-Select -->
              <div>
                <label
                  class="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-4"
                >
                  Shared Access <span class="text-gray-600">(Allow other tenants to see)</span>
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (tenant of tenants(); track tenant.id) {
                    @if (tenant.id !== selectedItem()?.tenantId) {
                      <label
                        class="flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group"
                        [ngClass]="
                          isTenantShared(tenant.id!)
                            ? 'border-indigo-400 bg-white'
                            : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                        "
                      >
                        <div class="flex items-center gap-3">
                          <input
                            type="checkbox"
                            [checked]="isTenantShared(tenant.id!)"
                            (change)="toggleTenantShare(tenant.id!)"
                            class="w-5 h-5 rounded-lg border-2 border-gray-200 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span
                            class="font-bold text-xs"
                            [ngClass]="
                              isTenantShared(tenant.id!) ? 'text-indigo-900' : 'text-gray-500'
                            "
                          >
                            {{ tenant.name }}
                          </span>
                        </div>
                        <span class="text-[9px] font-black text-gray-300 uppercase leading-none">{{
                          tenant.id
                        }}</span>
                      </label>
                    }
                  }
                </div>
              </div>
            </div>

            <div class="p-10 bg-gray-50/50 border-t border-gray-100 flex gap-4">
              <button
                (click)="showModal.set(false)"
                class="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition-all font-inter"
              >
                Cancel
              </button>
              <button
                (click)="saveChanges()"
                class="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f8fafc;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
    `,
  ],
})
export class ContentManagementComponent implements OnInit {
  content = signal<ContentDisplayDto[]>([]);
  tenants = signal<Tenant[]>([]);
  showModal = signal(false);
  selectedItem = signal<ContentDisplayDto | null>(null);
  sharedTenants = signal<string[]>([]);

  private adminService = inject(AdminService);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.apiAdminContentGet().subscribe((data) => this.content.set(data));
    this.adminService.apiAdminTenantsGet().subscribe((data) => this.tenants.set(data));
  }

  onOpenEditModal(item: ContentDisplayDto) {
    this.selectedItem.set(item);
    this.sharedTenants.set([...(item.sharedTenantIds || [])]);
    this.showModal.set(true);
  }

  isTenantShared(tenantId: string): boolean {
    return this.sharedTenants().includes(tenantId);
  }

  toggleTenantShare(tenantId: string) {
    const current = this.sharedTenants();
    if (current.includes(tenantId)) {
      this.sharedTenants.set(current.filter((id) => id !== tenantId));
    } else {
      this.sharedTenants.set([...current, tenantId]);
    }
  }

  updatePrimaryTenant(newTenantId: string) {
    if (!this.selectedItem()) return;
    const item = { ...this.selectedItem()!, tenantId: newTenantId };
    this.selectedItem.set(item);
    // Auto-remove from shared if it became primary
    this.sharedTenants.set(this.sharedTenants().filter((id) => id !== newTenantId));
  }

  saveChanges() {
    const item = this.selectedItem();
    if (!item) return;

    // 1. Update Primary if changed
    const original = this.content().find((c) => c.id === item.id);
    const primaryTask =
      original?.tenantId !== item.tenantId
        ? this.adminService.apiAdminContentReassignPost({
            entityType: 'Course',
            entityId: item.id as any,
            newTenantId: item.tenantId!,
          })
        : null;

    // 2. Update Sharing
    const sharingTask = this.adminService.apiAdminCourseSharePost({
      courseId: item.id as any,
      tenantIds: this.sharedTenants(),
    });

    if (primaryTask) {
      primaryTask.subscribe(() => {
        sharingTask.subscribe(() => {
          this.showModal.set(false);
          this.loadData();
        });
      });
    } else {
      sharingTask.subscribe(() => {
        this.showModal.set(false);
        this.loadData();
      });
    }
  }
}
