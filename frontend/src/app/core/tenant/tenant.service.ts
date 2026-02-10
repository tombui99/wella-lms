import { inject, Injectable, signal } from '@angular/core';
import { TenantsService as ApiTenantsService } from '../../api/api/tenants.service';
import { Tenant } from '../../api/model/models';
import { AuthenticationService } from '../auth/auth.service';
import { filter, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private apiTenantsService = inject(ApiTenantsService);
  private authService = inject(AuthenticationService);

  private currentTenantSignal = signal<Tenant | null>(null);
  public currentTenant = this.currentTenantSignal.asReadonly();

  constructor() {
    // Automatically load tenant info when user is authenticated
    toObservable(this.authService.userRole)
      .pipe(
        filter((role): role is string => !!role),
        switchMap(() => this.apiTenantsService.apiTenantsCurrentGet()),
      )
      .subscribe((tenant: Tenant) => {
        this.currentTenantSignal.set(tenant);
      });
  }

  refreshTenantInfo() {
    this.apiTenantsService.apiTenantsCurrentGet().subscribe((tenant: Tenant) => {
      this.currentTenantSignal.set(tenant);
    });
  }
}
