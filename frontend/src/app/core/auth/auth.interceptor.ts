import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const token = authService.getToken();
  const tenantId = authService.getTenantId();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (tenantId) {
    headers = headers.set('X-Tenant-Id', tenantId);
  }

  if (token || tenantId) {
    const cloned = req.clone({ headers });
    return next(cloned);
  }

  return next(req);
};
