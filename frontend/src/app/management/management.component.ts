import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
  title: string = '';  
  description: string = '';    
  selectedFile: File | null = null;  
  updatedTitle: string = '';  
  updatedDescription: string = '';  
  editingDocument: any = null;  
  bookings: any[] = []; 
  documents: any[] = []; 
  availableSlots: any[] = [];
  selectedSlot: { [key: number]: number } = {};

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getBookings(); 
    this.fetchDocuments(); 
    this.getAvailableSlots();
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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onEditDocument(document: any): void {
    this.editingDocument = document;
    this.updatedTitle = document.title;
    this.updatedDescription = document.description;
  }

  getBookings(): void {
    this.http.get<any[]>('http://localhost:3000/api/bookings')
      .subscribe({
        next: data => {
          this.bookings = data;
        },
        error: error => {
          console.error('Error fetching bookings', error);
        }
      });
  }

  getAvailableSlots(): void {
    const headers = this.getHeaders();  // ใช้ getHeaders เพื่อดึง token
    this.http.get<any[]>('http://localhost:3000/api/slots/available', { headers })
      .subscribe({
        next: data => {
          this.availableSlots = data;
        },
        error: error => {
          console.error('Error fetching available slots', error);
          Swal.fire('Error', 'Failed to fetch available slots. Please check your login status.', 'error');
        }
      });
  }
  

  fetchDocuments(): void {
    this.http.get<any[]>('http://localhost:3000/api/documents').subscribe({
      next: (data) => {
        this.documents = data;
      },
      error: (error) => {
        console.error('Error fetching documents:', error);
      }
    });
  }

  updateDocument(): void {
    const formData = new FormData();
    formData.append('title', this.updatedTitle || this.title);
    formData.append('description', this.updatedDescription || this.description);

    if (this.selectedFile) {
      formData.append('document', this.selectedFile);
    }

    const url = this.editingDocument 
      ? `http://localhost:3000/api/documents/${this.editingDocument.id}` 
      : 'http://localhost:3000/api/upload';

    const request$ = this.editingDocument
      ? this.http.put(url, formData, { headers: this.getHeaders() })
      : this.http.post(url, formData, { headers: this.getHeaders() });

    request$.subscribe({
      next: () => {
        Swal.fire({
          title: 'Success',
          text: this.editingDocument ? 'Document updated successfully!' : 'Document uploaded successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.fetchDocuments(); 
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'There was an error updating/uploading the document!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  updateStatus(bookingId: number, status: string): void {
    const body = { status };
    this.http.put(`http://localhost:3000/api/bookings/${bookingId}/status`, body)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Status updated successfully', 'success');
          this.getBookings(); 
        },
        error: (error) => {
          Swal.fire('Error!', 'Failed to update status.', 'error');
          console.error('Error updating booking status', error);
        }
      });
  }

  deleteBooking(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this booking!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:3000/api/bookings/${id}`, { headers: this.getHeaders()})
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Your booking has been deleted.', 'success');
              this.getBookings(); 
            },
            error: (error) => {
              Swal.fire('Error!', 'Failed to delete the booking.', 'error');
              console.error('Error deleting booking:', error);
            }
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your booking is safe :)', 'error');
      }
    });
  }

  deleteDocument(documentId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this document!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:3000/api/documents/${documentId}`, { headers: this.getHeaders() }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Document has been deleted.', 'success');
            this.fetchDocuments(); 
          },
          error: () => {
            Swal.fire('Delete Failed!', 'There was an error deleting the document.', 'error');
          }
        });
      }
    });
  }
  assignSelectedSlot(bookingId: number): void {
    const slotId = this.selectedSlot[bookingId];
    
    // ตรวจสอบว่า slotId ถูกต้องหรือไม่ก่อนส่งไป API
    if (!slotId) {
      Swal.fire('Error', 'Please select a slot before assigning.', 'error');
      return;
    }
  
    // ตรวจสอบว่าทั้ง bookingId และ slotId เป็นตัวเลข
    if (isNaN(bookingId) || isNaN(slotId)) {
      Swal.fire('Error', 'Booking ID and Slot ID must be numeric values.', 'error');
      return;
    }
  
    // ส่งข้อมูลไปที่ API
    const body = { Id: bookingId, slotId: slotId };
    this.http.post('http://localhost:3000/api/admin/assignSlot', body, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Slot assigned successfully!', 'success');
          this.getBookings(); 
          this.getAvailableSlots(); 
        },
        error: (error) => {
          Swal.fire('Error', 'Failed to assign slot.', 'error');
          console.error('Error assigning slot:', error);
        }
      });
  }
  
  
}