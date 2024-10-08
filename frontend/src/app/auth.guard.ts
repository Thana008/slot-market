import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const role = localStorage.getItem('role'); // Get role from localStorage

    if (role === 'admin') {
      return true; // Allow access to the route
    } else {
      // Redirect to a "Not Authorized" page or some other page
      this.router.navigate(['/not-authorized']);
      return false;
    }
  }
}
