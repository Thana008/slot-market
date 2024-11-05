import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  booking: any = null;
  selectedPaymentMethod: string = 'credit_card';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserBookingDetails(); // เปลี่ยนเป็นการดึงข้อมูลการจองทั้งหมดของผู้ใช้
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    } else {
      Swal.fire('Error', 'No valid token found, please log in again.', 'error');
      throw new Error('No valid token found'); 
    }
  }

  getUserBookingDetails(): void {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      Swal.fire('Error', 'User not found. Please log in again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(`http://localhost:3000/api/getUserBookings/${userId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          if (response.status === 'nothing') {
            Swal.fire('Error', 'No booking found for the user.', 'error');
            this.router.navigate(['/']);
          } else {
            this.booking = response; // เก็บข้อมูลการจองที่ได้จาก API
          }
        },
        error: (error) => {
          console.error('Error fetching booking details:', error);
          Swal.fire('Error', 'Failed to load booking details.', 'error');
        }
      });
  }

  confirmPayment(): void {
    if (!this.booking) {
      Swal.fire('Error', 'No booking available to confirm payment.', 'error');
      return;
    }

    const paymentData = {
      bookingId: this.booking.booking_id,
      paymentMethod: this.selectedPaymentMethod
    };

    this.http.post('http://localhost:3000/api/payments', paymentData, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Payment successful!', 'success');
          this.router.navigate(['/']); // กลับไปยังหน้าแรกหลังจากชำระเงินสำเร็จ
        },
        error: (error) => {
          console.error('Error processing payment:', error);
          Swal.fire('Error', 'Payment failed. Please try again.', 'error');
        }
      });
  }
}
