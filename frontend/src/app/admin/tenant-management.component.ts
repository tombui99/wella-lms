import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../api/api/admin.service';
import { Tenant } from '../api/model/models';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex justify-between items-end">
        <div>
          <h3 class="text-3xl font-black text-gray-900 tracking-tight italic">
            Tenants / Companies
          </h3>
          <p class="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
            Manage isolated business environments
          </p>
        </div>
        <button
          (click)="showCreateModal.set(true)"
          class="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          Register New Tenant
        </button>
      </div>

      <div class="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th
                class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Tenant ID
              </th>
              <th
                class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Company Name
              </th>
              <th
                class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Domain
              </th>
              <th
                class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Status
              </th>
              <th
                class="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (tenant of tenants(); track tenant.id) {
              <tr class="group hover:bg-indigo-50/30 transition-colors">
                <td class="px-8 py-6">
                  <span class="font-black text-indigo-600 text-sm italic">{{ tenant.id }}</span>
                </td>
                <td class="px-8 py-6">
                  <span class="font-bold text-gray-900">{{ tenant.name }}</span>
                </td>
                <td class="px-8 py-6">
                  <span class="text-sm font-medium text-gray-500 font-mono italic">{{
                    tenant.domain || 'N/A'
                  }}</span>
                </td>
                <td class="px-8 py-6">
                  <span
                    class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                    [ngClass]="
                      tenant.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ tenant.isActive ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <button
                    (click)="onEditTenant(tenant)"
                    class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="absolute inset-0 bg-indigo-950/40 backdrop-blur-md"
            (click)="showCreateModal.set(false)"
          ></div>

          <div
            class="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 animate-slide-up"
          >
            <div class="bg-indigo-900 p-8 text-white relative">
              <div
                class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"
              ></div>
              <h4 class="text-3xl font-black italic tracking-tight relative">
                {{ isEditMode() ? 'Edit Tenant' : 'New Tenant' }}
              </h4>
              <p class="text-sm font-bold text-indigo-300 uppercase tracking-widest mt-1 relative">
                {{ isEditMode() ? 'Update Enterprise' : 'Enterprise Registration' }}
              </p>
            </div>

            <form [formGroup]="tenantForm" (ngSubmit)="onSubmit()" class="p-10 space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label
                    class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >Unique Identifier</label
                  >
                  <input
                    formControlName="id"
                    type="text"
                    [readonly]="isEditMode()"
                    class="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-100 text-gray-900 placeholder-gray-300 font-bold transition-all disabled:opacity-50"
                    placeholder="company-slug"
                  />
                </div>
                <div>
                  <label
                    class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1"
                    >Company Name</label
                  >
                  <input
                    formControlName="name"
                    type="text"
                    class="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-100 text-gray-900 placeholder-gray-300 font-bold transition-all"
                    placeholder="ACME Corp"
                  />
                </div>
              </div>

              <div>
                <label
                  class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1"
                  >Custom Domain (Optional)</label
                >
                <input
                  formControlName="domain"
                  type="text"
                  class="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-indigo-100 text-gray-900 placeholder-gray-300 font-bold transition-all"
                  placeholder="lms.acme.com"
                />
              </div>

              <div>
                <label class="flex items-center gap-3 cursor-pointer group">
                  <div class="relative">
                    <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                    <div
                      class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-indigo-600 transition-colors"
                    >Is Active</span
                  >
                </label>
              </div>

              <div class="flex gap-4 pt-6">
                <button
                  type="button"
                  (click)="showCreateModal.set(false)"
                  class="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="tenantForm.invalid"
                  class="flex-2 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {{ isEditMode() ? 'Save Changes' : 'Confirm & Register' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class TenantManagementComponent implements OnInit {
  tenants = signal<Tenant[]>([]);
  showCreateModal = signal(false);
  isEditMode = signal(false);
  tenantForm: FormGroup;

  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  constructor() {
    this.tenantForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      domain: [''],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.apiAdminTenantsGet().subscribe((tenants) => this.tenants.set(tenants));
  }

  onEditTenant(tenant: Tenant) {
    this.isEditMode.set(true);
    this.tenantForm.patchValue(tenant);
    this.showCreateModal.set(true);
  }

  onSubmit() {
    if (this.tenantForm.valid) {
      const request = this.isEditMode()
        ? this.adminService.apiAdminTenantsIdPut(this.tenantForm.value.id, this.tenantForm.value)
        : this.adminService.apiAdminTenantsPost(this.tenantForm.value);

      request.subscribe(() => {
        this.showCreateModal.set(false);
        this.tenantForm.reset({ isActive: true });
        this.loadData();
      });
    }
  }
}
