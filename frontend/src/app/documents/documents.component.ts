import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDocuments(); // ดึงข้อมูลเมื่อ component โหลด
  }

  fetchDocuments(): void {
    this.http.get<any[]>('http://localhost:3000/api/documents').subscribe(
      (data) => {
        this.documents = data; // เก็บเอกสารในตัวแปร documents
      },
      (error) => {
        console.error('Error fetching documents:', error);
      }
    );
  }
}
