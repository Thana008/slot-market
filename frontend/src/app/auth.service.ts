// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // ปรับ URL API ตามต้องการ
  
  private loggedIn = new BehaviorSubject<boolean>(false); // ติดตามสถานะการล็อกอิน
  private role = new BehaviorSubject<string | null>(null); // ติดตามบทบาทผู้ใช้
  private username = new BehaviorSubject<string | null>(null); // ติดตามชื่อผู้ใช้

  // Expose observables สำหรับสถานะการล็อกอิน, บทบาท, และชื่อผู้ใช้
  isLoggedIn$ = this.loggedIn.asObservable();
  userRole$ = this.role.asObservable();
  username$ = this.username.asObservable();

  constructor(private http: HttpClient) {
    this.checkLoginStatus(); // ตรวจสอบสถานะการล็อกอินเมื่อเริ่มต้น
  }

  // สมัครสมาชิกผู้ใช้
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // ล็อกอินผู้ใช้ผ่าน API และอัปเดตสถานะการล็อกอิน
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // บันทึกข้อมูลการล็อกอินและอัปเดตสถานะ
  handleLogin(token: string, username: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    this.loggedIn.next(true);
    this.role.next(role);
    this.username.next(username);

    console.log('User logged in:', { token, username, role });
  }

  // ออกจากระบบผู้ใช้และรีเซ็ตสถานะ
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    this.loggedIn.next(false);
    this.role.next(null);
    this.username.next(null);

    console.log('User logged out');
  }

  // ตรวจสอบสถานะการล็อกอินจาก localStorage เมื่อเริ่มต้น
  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    if (token) {
      this.loggedIn.next(true);
      this.role.next(role);
      this.username.next(username);
      console.log('Login status checked: User is logged in');
    } else {
      this.loggedIn.next(false);
      this.role.next(null);
      this.username.next(null);
      console.log('Login status checked: User is not logged in');
    }
  }
}
