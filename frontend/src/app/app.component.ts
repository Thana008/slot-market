import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  username: string | null = '';
  userRole: string | null = '';

  constructor(
    private router: Router, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef // Ensure to include ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to the login state and role from the AuthService
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;

      if (this.isLoggedIn) {
        this.username = localStorage.getItem('username'); // Get the username from localStorage
        this.userRole = localStorage.getItem('role'); // Get the role from localStorage
      } else {
        this.username = ''; // Clear username when not logged in
        this.userRole = ''; // Clear role when not logged in
      }

      // Trigger change detection to ensure the view updates
      this.cdr.detectChanges();
    });

    // Also subscribe to the userRole separately if necessary
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
      this.cdr.detectChanges(); // Detect changes if role is updated
    });
  }

  // Logout and redirect to the login page
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Navigate to login after logout
  }
}
