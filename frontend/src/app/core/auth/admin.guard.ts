import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthenticationService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.getUserRole() === 'Admin') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
