import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-payments',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getPayments();
  }

  getPayments(): void {
    const userId = 1; // Example userId, replace with dynamic userId
    this.http.get<any[]>(`http://localhost:3000/api/payments/${userId}`).subscribe(
      data => this.payments = data,
      error => console.error('Error fetching payments:', error)
    );
  }

  pay(paymentId: number): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.put(`http://localhost:3000/api/payments/${paymentId}`, {}, { headers }).subscribe(
      () => {
        alert('Payment successful');
        this.getPayments();
      },
      error => console.error('Error making payment:', error)
    );
  }
}
