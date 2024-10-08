import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'vendor'; 

  private apiUrl = 'http://localhost:3000/auth/register'; // Replace with your API URL

  constructor(private http: HttpClient, private router: Router) {} // Inject Router here

  registerUser() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    this.http.post(this.apiUrl, userData).subscribe(
      response => {
        console.log('Register successful', response);
        alert('Registration successful');
        this.router.navigate(['/login']); // Navigate to the login page after successful registration
      },
      error => {
        console.error('Register failed', error);
        alert('Registration failed. Please try again.');
      }
    );
  }
}
