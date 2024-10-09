import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  availableSpaces: any[] = []; // Declare variable to store available spaces
  private apiUrl = 'http://localhost:3000/api/market_slots'; // Update with your API URL

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAvailableSpaces(); // Call function when component is initialized
  }

  // Function to get available spaces
  getAvailableSpaces(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Function to load available spaces
  loadAvailableSpaces(): void {
    this.getAvailableSpaces().subscribe(
      (data) => {
        this.availableSpaces = data; // Store fetched data in availableSpaces variable
      },
      (error) => {
        console.error('Error fetching available spaces:', error);
      }
    );
  }
}
