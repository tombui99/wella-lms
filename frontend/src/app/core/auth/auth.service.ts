import { Injectable } from '@angular/core';
import { AuthService as ApiAuthService } from '../../api/api/auth.service';
import { LoginDto, RegisterDto } from '../../api/model/models';
import { BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private tokenKey = 'bifrost_token';
  private roleKey = 'bifrost_role';
  private tenantKey = 'bifrost_tenant';

  // To update UI reactively
  private userRoleSignal = signal<string | null>(this.getUserRole());
  public userRole = this.userRoleSignal.asReadonly();

  constructor(
    private apiAuthService: ApiAuthService,
    private router: Router,
  ) {}

  login(credentials: LoginDto) {
    return this.apiAuthService.apiAuthLoginPost(credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.roleKey, response.role);
          localStorage.setItem(this.tenantKey, response.tenantId);
          this.userRoleSignal.set(response.role);
        }
      }),
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.tenantKey);
    this.userRoleSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getTenantId(): string | null {
    return localStorage.getItem(this.tenantKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
