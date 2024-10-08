import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  loginUser() {
    const credentials = {
      username: this.username,
      password: this.password,
    };

    this.authService.login(credentials).subscribe(response => {
      console.log('Login successful', response);
    }, error => {
      console.error('Login failed', error);
    });
  }
}
