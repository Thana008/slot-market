import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  registerUser() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'user' // กำหนดค่า role เป็น 'user'
    };

    this.authService.register(userData).subscribe(
      response => {
        console.log('Register successful', response);
        alert('Registration successful');
      },
      error => {
        console.error('Register failed', error);
        alert('Registration failed. Please try again.');
      }
    );
  }
}
