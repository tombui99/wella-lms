import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../api/api/admin.service';
import { Tenant } from '../api/model/models';
import { HttpClient } from '@angular/common/http';
import { BASE_PATH } from '../api/variables';

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
          (click)="openCreateModal()"
          class="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2-2h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
                Logo
              </th>
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
                  <div
                    class="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-gray-100 group-hover:border-indigo-200 transition-all"
                  >
                    @if (tenant.logoUrl) {
                      <img
                        [src]="basePath + tenant.logoUrl"
                        class="w-full h-full object-contain p-1"
                      />
                    } @else {
                      <span class="text-xs font-black text-gray-300 italic">{{
                        tenant.id?.substring(0, 2)?.toUpperCase()
                      }}</span>
                    }
                  </div>
                </td>
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
            (click)="closeModal()"
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
              <!-- Logo Upload Section -->
              <div
                class="flex items-center gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100"
              >
                <div class="relative group cursor-pointer" (click)="logoInput.click()">
                  <div
                    class="w-24 h-24 rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden flex items-center justify-center group-hover:border-indigo-300 transition-all"
                  >
                    @if (logoPreview() || currentLogoUrl()) {
                      <img
                        [src]="logoPreview() || basePath + currentLogoUrl()"
                        class="w-full h-full object-contain p-2"
                      />
                    } @else {
                      <svg
                        class="w-8 h-8 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                    <div
                      class="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    >
                      <svg
                        class="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    #logoInput
                    type="file"
                    class="hidden"
                    (change)="onFileSelected($event)"
                    accept="image/*"
                  />
                </div>

                <div class="flex-1 space-y-2">
                  <h5 class="text-sm font-black text-gray-900 uppercase tracking-wider">
                    Company Logo
                  </h5>
                  <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                    Attach your brand identity
                  </p>
                  <div class="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      (click)="logoInput.click()"
                      class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Change Logo
                    </button>
                    @if (currentLogoUrl() || logoPreview()) {
                      <span class="text-gray-300 text-[10px]">•</span>
                      <button
                        type="button"
                        (click)="deleteLogo()"
                        class="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    }
                  </div>
                </div>
              </div>

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
                  (click)="closeModal()"
                  class="flex-1 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="tenantForm.invalid || isSubmitting()"
                  class="flex-2 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  }
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
  isSubmitting = signal(false);
  tenantForm: FormGroup;

  logoPreview = signal<string | null>(null);
  currentLogoUrl = signal<string | null>(null);
  selectedFile: File | null = null;

  basePath = inject(BASE_PATH);
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

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

  openCreateModal() {
    this.isEditMode.set(false);
    this.tenantForm.reset({ isActive: true });
    this.logoPreview.set(null);
    this.currentLogoUrl.set(null);
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  onEditTenant(tenant: Tenant) {
    this.isEditMode.set(true);
    this.tenantForm.patchValue(tenant);
    this.currentLogoUrl.set(tenant.logoUrl || null);
    this.logoPreview.set(null);
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  closeModal() {
    this.showCreateModal.set(false);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  deleteLogo() {
    if (this.isEditMode() && this.currentLogoUrl()) {
      const tenantId = this.tenantForm.value.id;
      this.adminService.apiAdminTenantsIdLogoDelete(tenantId).subscribe(() => {
        this.currentLogoUrl.set(null);
        this.logoPreview.set(null);
        this.selectedFile = null;
        this.loadData();
      });
    } else {
      this.logoPreview.set(null);
      this.selectedFile = null;
    }
  }

  onSubmit() {
    if (this.tenantForm.valid) {
      this.isSubmitting.set(true);
      const tenantData = this.tenantForm.value;
      const request = this.isEditMode()
        ? this.adminService.apiAdminTenantsIdPut(tenantData.id, tenantData)
        : this.adminService.apiAdminTenantsPost(tenantData);

      request.subscribe({
        next: (response: any) => {
          const tenantId = this.isEditMode() ? tenantData.id : response.id || tenantData.id;

          if (this.selectedFile) {
            this.uploadLogo(tenantId);
          } else {
            this.onSuccess();
          }
        },
        error: () => this.isSubmitting.set(false),
      });
    }
  }

  uploadLogo(tenantId: string) {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${this.basePath}/api/Admin/tenants/${tenantId}/logo`, formData).subscribe({
      next: () => this.onSuccess(),
      error: () => this.isSubmitting.set(false),
    });
  }

  private onSuccess() {
    this.isSubmitting.set(false);
    this.showCreateModal.set(false);
    this.loadData();
  }
}
