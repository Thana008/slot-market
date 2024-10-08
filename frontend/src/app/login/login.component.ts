import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ตรวจสอบให้แน่ใจว่า HttpClient ถูก import แล้ว

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) { }

  loginUser() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    // ใช้ AuthService ในการจัดการคำร้องขอล็อกอิน
    this.authService.login(loginData).subscribe(
      (response: any) => {
        // เก็บ token และรายละเอียดผู้ใช้ใน localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_id', response.user.id);
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('role', response.user.role);

        // นำผู้ใช้ไปยัง dashboard ที่เหมาะสมตาม role
        if (response.user.role === 'admin') {
          this.router.navigate(['/management']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error => {
        console.error('การล็อกอินล้มเหลว', error);
        alert('การล็อกอินล้มเหลว โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง');
      }
    );
  }
}