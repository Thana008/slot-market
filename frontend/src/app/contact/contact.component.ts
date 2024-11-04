import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  showAlert(type: string, info: string) {
    Swal.fire({
      title: `${type}`,
      text: `${info}`,
      icon: 'info',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#3085d6',
    });
  }
}
