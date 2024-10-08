import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Make sure to import HttpClient if you need it

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {} // Inject AuthService here

  loginUser() {
    const credentials = {
      username: this.username,
      password: this.password,
    };

    this.authService.login(credentials).subscribe(
      response => {
        console.log('Login successful', response);
        // Optionally store user info in local storage or handle the response accordingly
        this.router.navigate(['/home']); // Navigate to the home page after successful login
      },
      error => {
        console.error('Login failed', error);
        alert('Login failed. Please check your credentials and try again.'); // User feedback for login failure
      }
    );
  }
}
