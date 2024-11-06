import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailComponent implements OnInit {
  // ข้อมูล slots ทั้งหมด
  slots = [
    {
      "id": 1,
      "name": "KU-Market Slot 1",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 2,
      "name": "KU-Market Slot 2",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 3,
      "name": "KU-Market Slot 3",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 4,
      "name": "KU-Market Slot 4",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 5,
      "name": "KU-Market Slot 5",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 6,
      "name": "KU-Market Slot 6",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 7,
      "name": "KU-Market Slot 7",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 8,
      "name": "KU-Market Slot 8",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 9,
      "name": "KU-Market Slot 9",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 10,
      "name": "KU-Market Slot 10",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 11,
      "name": "KU-Market Slot 11",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 12,
      "name": "KU-Market Slot 12",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 13,
      "name": "KU-Market Slot 13",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 14,
      "name": "KU-Market Slot 14",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 15,
      "name": "KU-Market Slot 15",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 16,
      "name": "KU-Market Slot 16",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 17,
      "name": "KU-Market Slot 17",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 18,
      "name": "KU-Market Slot 18",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 19,
      "name": "KU-Market Slot 19",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 20,
      "name": "KU-Market Slot 20",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 21,
      "name": "KU-Market Slot 21",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 22,
      "name": "KU-Market Slot 22",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 23,
      "name": "KU-Market Slot 23",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 24,
      "name": "KU-Market Slot 24",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 25,
      "name": "KU-Market Slot 25",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 26,
      "name": "KU-Market Slot 26",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 27,
      "name": "KU-Market Slot 27",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 28,
      "name": "KU-Market Slot 28",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 29,
      "name": "KU-Market Slot 29",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 30,
      "name": "KU-Market Slot 30",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 31,
      "name": "KU-Market Slot 31",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 32,
      "name": "KU-Market Slot 32",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 33,
      "name": "KU-Market Slot 33",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 34,
      "name": "KU-Market Slot 34",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 35,
      "name": "KU-Market Slot 35",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 36,
      "name": "KU-Market Slot 36",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 37,
      "name": "KU-Market Slot 37",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 38,
      "name": "KU-Market Slot 38",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 39,
      "name": "KU-Market Slot 39",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 40,
      "name": "KU-Market Slot 40",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 41,
      "name": "KU-Market Slot 41",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 42,
      "name": "KU-Market Slot 42",
      "size": "4 x 3.00 ตารางเมตร",
     "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 43,
      "name": "KU-Market Slot 43",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 44,
      "name": "KU-Market Slot 44",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 45,
      "name": "KU-Market Slot 45",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 46,
      "name": "KU-Market Slot 46",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 47,
      "name": "KU-Market Slot 47",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 48,
      "name": "KU-Market Slot 48",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 49,
      "name": "KU-Market Slot 49",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 50,
      "name": "KU-Market Slot 50",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 51,
      "name": "KU-Market Slot 51",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 52,
      "name": "KU-Market Slot 52",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 53,
      "name": "KU-Market Slot 53",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 54,
      "name": "KU-Market Slot 54",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 55,
      "name": "KU-Market Slot 55",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 56,
      "name": "KU-Market Slot 56",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 57,
      "name": "KU-Market Slot 57",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 58,
      "name": "KU-Market Slot 58",
      "size": "2 x 2.30 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 59,
      "name": "KU-Market Slot 59",
      "size": "3 x 2.50 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    },
    {
      "id": 60,
      "name": "KU-Market Slot 60",
      "size": "4 x 3.00 ตารางเมตร",
      "images": ["assets/01.png", "assets/02.png", "assets/03.png"]
    }
];
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private router: Router) { }

  ngOnInit(): void {}

  get paginatedSlots() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.slots.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  get totalPages() {
    return Math.ceil(this.slots.length / this.itemsPerPage);
  }
}
