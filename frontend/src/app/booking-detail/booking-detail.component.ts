import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailComponent implements OnInit {
  // ข้อมูล slots ของคุณ
  slots = [
    { id: 1, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image1.jpg' },
    { id: 2, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image2.jpg' },
    { id: 3, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image3.jpg' },
    { id: 4, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image4.jpg' },
    { id: 5, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image5.jpg' },
    { id: 6, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image6.jpg' },
    { id: 7, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image7.jpg' },
    { id: 8, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image8.jpg' },
    { id: 9, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image9.jpg' },
    { id: 10, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image10.jpg' },
    { id: 11, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image11.jpg' },
    { id: 12, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image12.jpg' },
    { id: 13, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image13.jpg' },
    { id: 14, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image14.jpg' },
    { id: 15, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image15.jpg' },
    { id: 16, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image16.jpg' },
    { id: 17, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image17.jpg' },
    { id: 18, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image18.jpg' },
    { id: 19, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image19.jpg' },
    { id: 20, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image20.jpg' },
    { id: 21, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image21.jpg' },
    { id: 22, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image22.jpg' },
    { id: 23, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image23.jpg' },
    { id: 24, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image24.jpg' },
    { id: 25, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image25.jpg' },
    { id: 26, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image26.jpg' },
    { id: 27, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image27.jpg' },
    { id: 28, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image28.jpg' },
    { id: 29, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image29.jpg' },
    { id: 30, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image30.jpg' },
    { id: 31, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image31.jpg' },
    { id: 32, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image32.jpg' },
    { id: 33, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image33.jpg' },
    { id: 34, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image34.jpg' },
    { id: 35, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image35.jpg' },
    { id: 36, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image36.jpg' },
    { id: 37, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image37.jpg' },
    { id: 38, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image38.jpg' },
    { id: 39, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image39.jpg' },
    { id: 40, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image40.jpg' },
    { id: 41, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image41.jpg' },
    { id: 42, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image42.jpg' },
    { id: 43, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image43.jpg' },
    { id: 44, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image44.jpg' },
    { id: 45, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image45.jpg' },
    { id: 46, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image46.jpg' },
    { id: 47, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image47.jpg' },
    { id: 48, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image48.jpg' },
    { id: 49, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image49.jpg' },
    { id: 50, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image50.jpg' },
    { id: 51, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image51.jpg' },
    { id: 52, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image52.jpg' },
    { id: 53, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image53.jpg' },
    { id: 54, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image54.jpg' },
    { id: 55, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image55.jpg' },
    { id: 56, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image56.jpg' },
    { id: 57, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image57.jpg' },
    { id: 58, name: 'KU-Market', size: '2 x 2.30 ตารางเมตร', image: 'assets/images/market-image58.jpg' },
    { id: 59, name: 'KU-Market', size: '3 x 2.50 ตารางเมตร', image: 'assets/images/market-image59.jpg' },
    { id: 60, name: 'KU-Market', size: '4 x 3.00 ตารางเมตร', image: 'assets/images/market-image60.jpg' },
  ];
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private router: Router) { } // เพิ่ม Router ที่นี่

  // confirmBooking() {
  //   Swal.fire({
  //     title: 'ยืนยันการจองพื้นที่นี้หรือไม่?',
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'ยืนยัน',
  //     cancelButtonText: 'ยกเลิก'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // เมื่อยืนยัน ให้ไปหน้า booking
  //       this.router.navigate(['/booking']);
  //     } else if (result.isDismissed) {
  //       // เมื่อยกเลิก ให้ไปหน้า booking-detail
  //       this.router.navigate(['/booking-detail']);
  //     }
  //   });
  // }

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