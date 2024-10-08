import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
  bookings: any[] = []; // To store all bookings

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getBookings();
  }

  // Fetch all bookings
  getBookings(): void {
    this.http.get<any[]>('http://localhost:3000/api/bookings')
      .subscribe(data => {
        this.bookings = data;
      }, error => {
        console.error('Error fetching bookings', error);
      });
  }

  // Update booking status
  updateStatus(bookingId: number, status: string): void {
    const body = { status };
    this.http.put(`http://localhost:3000/api/bookings/${bookingId}/status`, body)
      .subscribe(() => {
        alert('Status updated successfully');
        this.getBookings(); // Refresh the bookings list after update
      }, error => {
        console.error('Error updating booking status', error);
      });
  }
}
