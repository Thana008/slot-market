import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  name: string = '';
  email: string = '';
  role: string = '';
  profileImage: string | ArrayBuffer | null = null;
  editMode = false;
  selectedFile: File | null = null;

  // ข้อมูลการจองที่จะแสดงใน Booking Information Card
  userBooking: any = {
    id: '',
    status: '',
    slot_id: '',
    payment_status: '',
    foodtype: ''
  };

  updatedName: string = '';
  updatedEmail: string = '';
  currentPassword: string = ''; // รหัสผ่านปัจจุบัน
  newPassword: string = ''; // รหัสผ่านใหม่
  confirmPassword: string = ''; // ยืนยันรหัสผ่านใหม่

  constructor(private http: HttpClient, private router: Router) {} // Inject Router

  ngOnInit(): void {
    this.name = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || 'john.doe@example.com';
    this.getUserBookings(); // ดึงข้อมูลการจองทั้งหมดของผู้ใช้
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.profileImage = e.target?.result || '';
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateProfile(): void {
    // ตรวจสอบว่าถ้ากรอกรหัสผ่านใหม่ ต้องกรอกรหัสผ่านปัจจุบันและยืนยันรหัสผ่านด้วย
    if (this.newPassword || this.confirmPassword || this.currentPassword) {
      if (!this.currentPassword) {
        Swal.fire('Error', 'Please enter your current password.', 'error');
        return;
      }
  
      if (this.newPassword.length < 8) {
        Swal.fire('Error', 'New password must be at least 8 characters long.', 'error');
        return;
      }
  
      if (this.newPassword !== this.confirmPassword) {
        Swal.fire('Error', 'New passwords do not match.', 'error');
        return;
      }
    }
  
    // ตรวจสอบ username ซ้ำก่อนอัปเดต
    const checkUsernameUrl = `http://localhost:3000/api/check-username?username=${this.name}&userId=${localStorage.getItem('user_id')}`;
  
    this.http.get(checkUsernameUrl).subscribe(
      (response: any) => {
        if (response.exists) {
          Swal.fire('Error', 'Username is already taken. Please choose another one.', 'error');
        } else {
          // ดำเนินการอัปเดตโปรไฟล์หาก username ไม่ซ้ำ
          const updatedProfile: any = {
            username: this.name,
            email: this.email
          };
  
          // ถ้ามีการกรอกรหัสผ่านใหม่ ให้เพิ่มการอัปเดตรหัสผ่าน
          if (this.newPassword) {
            updatedProfile.currentPassword = this.currentPassword;
            updatedProfile.newPassword = this.newPassword;
          }
  
          const token = localStorage.getItem('token');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
          this.http.post('http://localhost:3000/api/update-profile', updatedProfile, { headers })
            .subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Profile updated successfully',
                  showConfirmButton: false,
                  timer: 1500
                });
  
                // Reset password fields after updating successfully
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
  
                this.editMode = false; // ออกจากโหมดแก้ไขหลังจากอัปเดตโปรไฟล์สำเร็จ
              },
              error: (error) => {
                if (error.status === 400 && error.error.message === 'Current password is incorrect') {
                  Swal.fire('Error', 'Current password is incorrect.', 'error');
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Failed to update profile',
                    text: error.message
                  });
                }
              }
            });
        }
      },
      error => {
        Swal.fire('Error', 'Error checking username. Please try again.', 'error');
        console.error('Error checking username:', error);
      }
    );
  }
  
  getUserBookings(): void {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get<any[]>(`http://localhost:3000/api/getUserBookings/${userId}`, { headers })
      .subscribe({
        next: (response) => {
          console.log('User bookings:', response); // ตรวจสอบข้อมูลที่ได้
          this.userBooking = response; // เก็บข้อมูลการจองทั้งหมดใน userBookings
        },
        error: (error) => {
          console.error('Error fetching booking information:', error);
        }
      });
  }

  saveProfile(): void {
    const updatedProfile = {
      name: this.updatedName,
      email: this.updatedEmail
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/api/update-profile', updatedProfile, { headers })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Profile updated successfully',
            showConfirmButton: false,
            timer: 1500
          });

          this.name = this.updatedName;
          this.email = this.updatedEmail;

          this.editMode = false;
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Failed to update profile',
            text: error.message
          });
        }
      });
  }

  cancelBooking(): void {
    if (this.userBooking.status === 'confirmed') {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put(`http://localhost:3000/api/cancelBooking/${userId}`, {}, { headers })
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Booking cancelled successfully', 'success');
            this.userBooking.status = 'cancelled';
            this.userBooking.slot_id = ''; 
          },
          error: () => {
            Swal.fire('Error', 'Failed to cancel booking', 'error');
          }
        });
    }
  }

  printReceipt(): void {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get(`http://localhost:3000/api/receipt/${userId}`, { headers, responseType: 'blob' })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.download = `Receipt_Booking_${userId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url); // ทำการล้าง URL หลังจากดาวน์โหลดเสร็จ
        },
        error: (error) => {
          Swal.fire('Error', 'Unable to generate receipt.', 'error');
          console.error('Error fetching receipt:', error);
        }
      });
  }
  
  navigateToPayments(): void {
    // Redirect to the payments page for the current booking
    this.router.navigate(['/payments'], { queryParams: { bookingId: this.userBooking.id } });
  }
}
