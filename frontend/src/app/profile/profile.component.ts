import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  bookingStatus: string = '';
  assignedSlot: string = ''; // ตัวแปรสำหรับ slot ที่ได้รับ

  updatedName: string = '';
  updatedEmail: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.name = localStorage.getItem('username') || '';
    this.email = 'john.doe@example.com';
    this.getUserSlot(); // ดึงข้อมูล slot ของผู้ใช้

    this.getBookingStatus();
  }

  getBookingStatus(): void {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ status: string }>(`http://localhost:3000/api/getUserBookingStatus/${userId}`, { headers })
      .subscribe({
        next: (response) => {
          this.bookingStatus = response.status;
        },
        error: (error) => {
          console.error('Error fetching booking status:', error);
          this.bookingStatus = 'Error loading status';
        }
      });
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
    const updatedProfile = {
      name: this.name,
      email: this.email
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
  
          this.editMode = false; // ออกจากโหมดแก้ไขหลังจากอัปเดตโปรไฟล์สำเร็จ
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

  getUserSlot(): void {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get<{ slot: string }>(`http://localhost:3000/api/getUserSlot/${userId}`, { headers })
      .subscribe(response => {
        this.assignedSlot = response.slot;
      }, error => {
        console.error('Error fetching user slot:', error);
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
    if (this.bookingStatus === 'confirmed') {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put(`http://localhost:3000/api/cancelBooking/${userId}`, {}, { headers })
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Booking cancelled successfully', 'success');
            this.bookingStatus = 'cancelled';
          },
          error: () => {
            Swal.fire('Error', 'Failed to cancel booking', 'error');
          }
        });
    }
  }
}
