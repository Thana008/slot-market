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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getBookings(); 
    this.fetchDocuments(); 
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
      .subscribe(data => {
        this.bookings = data;
      }, error => {
        console.error('Error fetching bookings', error);
      });
  }

  fetchDocuments(): void {
    this.http.get<any[]>('http://localhost:3000/api/documents').subscribe(
      (data) => {
        this.documents = data;
      },
      (error) => {
        console.error('Error fetching documents:', error);
      }
    );
  }

  assignRandomSlot(bookingId: number): void {
    console.log('Sending userId:', bookingId);  // เพิ่ม log เพื่อดูค่าที่ส่ง
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post<any>('http://localhost:3000/api/admin/assignSlot', { userId: bookingId }, { headers })
      .subscribe({
        next: (response) => {
          Swal.fire('Success', `Slot ${response.slotName} assigned successfully!`, 'success');
          this.getBookings(); // Refresh the list
        },
        error: (error) => {
          Swal.fire('Error!', 'Failed to assign a slot.', 'error');
          console.error('Error assigning slot:', error);
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
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    const url = this.editingDocument 
      ? `http://localhost:3000/api/documents/${this.editingDocument.id}` 
      : 'http://localhost:3000/api/upload';
  
    this.http.put(url, formData, { headers })
      .subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Success',
            text: this.editingDocument ? 'Document updated successfully!' : 'Document uploaded successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.fetchDocuments(); 
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'There was an error updating the document!',
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this booking!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:3000/api/bookings/${id}`, { headers })
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
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.delete(`http://localhost:3000/api/documents/${documentId}`, { headers }).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Document has been deleted.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.fetchDocuments(); 
          },
          error: (err) => {
            Swal.fire({
              title: 'Delete Failed!',
              text: 'There was an error deleting the document.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  editDocument(documentId: number, updatedTitle: string, updatedDescription: string, selectedFile?: File): void {
    const formData = new FormData();
    formData.append('title', updatedTitle);
    formData.append('description', updatedDescription);
    if (selectedFile) {
      formData.append('document', selectedFile);
    }
  
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.put(`http://localhost:3000/api/documents/${documentId}`, formData, { headers }).subscribe({
      next: (response) => {
        console.log('Document updated successfully:', response);
        this.fetchDocuments(); 
      },
      error: (error) => {
        console.error('Error updating document:', error);
      }
    });
  } 
}
