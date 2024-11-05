import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent {
  bookingData = {
    firstname: '',
    lastname: '',
    phone: '',
    foodtype: '',
    user_id: localStorage.getItem('user_id'), // ดึง user_id จาก localStorage
    slot_id: 1, // อาจจะดึงจากหน้าอื่นหรือกำหนดค่าไว้
    booking_date: new Date().toISOString(), // ใช้วันที่ปัจจุบัน
  };

  constructor(private http: HttpClient, private router: Router) { }

  confirmBooking(): void {
    Swal.fire({
      title: 'ยืนยันการจอง',
      text: 'คุณต้องการยืนยันการลงทะเบียนหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitBooking();
      }
    });
  }

  submitBooking(): void {
    // ส่งข้อมูลการจองไปยัง backend
    this.http.post('http://localhost:3000/api/bookings', this.bookingData)
      .subscribe(response => {
        Swal.fire('สำเร็จ!', 'ลงทะเบียนสำเร็จ!', 'success');
        this.router.navigate(['/']); // กลับไปยังหน้าแรกหลังจากสำเร็จ
      }, error => {
        console.error('Error:', error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลงทะเบียนได้', 'error');
      });
  }
}
