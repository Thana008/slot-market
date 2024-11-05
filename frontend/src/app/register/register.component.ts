import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = ''; // เพิ่มตัวแปร confirmPassword
  role: string = 'vendor';

  private apiUrl = 'http://localhost:3000/auth/register'; // Replace with your API URL
  private checkUsernameUrl = 'http://localhost:3000/auth/check-username'; // URL สำหรับเช็ค username

  constructor(private http: HttpClient, private router: Router) {} // Inject Router here

  registerUser() {
    if (!this.isValidEmail(this.email)) {
      Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    if (this.password.length < 8) {
      Swal.fire('Weak Password', 'Password must be at least 8 characters long.', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire('Password Mismatch', 'Passwords do not match.', 'warning');
      return;
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    this.http.get(`${this.checkUsernameUrl}?username=${this.username}`).subscribe(
      (response: any) => {
        if (response.exists) {
          Swal.fire('Username Taken', 'Username is already taken. Please choose another one.', 'warning');
        } else {
          // ถ้าไม่ซ้ำ ทำการลงทะเบียน
          const userData = {
            username: this.username,
            email: this.email,
            password: this.password,
            role: this.role,
          };

          this.http.post(this.apiUrl, userData).subscribe(
            response => {
              console.log('Register successful', response);
              Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'You have successfully registered!',
                confirmButtonText: 'OK',
              }).then(() => {
                this.router.navigate(['/login']); // Navigate to the login page after successful registration
              });
            },
            error => {
              console.error('Register failed', error);
              Swal.fire('Registration Failed', 'Unable to register. Please try again later.', 'error');
            }
          );
        }
      },
      error => {
        console.error('Error checking username:', error);
        Swal.fire('Error', 'Error checking username. Please try again.', 'error');
      }
    );
  }

  // Function to validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
