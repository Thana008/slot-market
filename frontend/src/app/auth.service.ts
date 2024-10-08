import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Set your API URL here
  
  private loggedIn = new BehaviorSubject<boolean>(false); // Track login state
  private role = new BehaviorSubject<string | null>(null); // Track user role

  // Expose observables for login status and role
  isLoggedIn$ = this.loggedIn.asObservable();
  userRole$ = this.role.asObservable();

  constructor(private http: HttpClient) {
    this.checkLoginStatus(); // Check login state on startup
  }

  // Register user
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Login user via API and update login state
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Save login info and update state
  handleLogin(token: string, username: string, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    this.loggedIn.next(true);
    this.role.next(role);
  }

  // Logout user and reset state
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    this.loggedIn.next(false);
    this.role.next(null);
  }

  // Check login status from localStorage on startup
  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      this.loggedIn.next(true);
      this.role.next(role);
    } else {
      this.loggedIn.next(false);
      this.role.next(null);
    }
  }
}
