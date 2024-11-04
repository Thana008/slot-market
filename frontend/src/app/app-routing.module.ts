import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { BookingComponent } from './booking/booking.component';
import { DocumentsComponent } from './documents/documents.component';
import { ContactComponent } from './contact/contact.component';
import { ManagementComponent } from './management/management.component';
import { RegisterComponent } from './register/register.component';
import { BookingDetailComponent } from './booking-detail/booking-detail.component';
import { AuthGuard } from './auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { PaymentsComponent } from './payment/payment.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // เส้นทางเริ่มต้น, ถ้าไม่มีเส้นทางจะไปที่ Home
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'booking-detail', component: BookingDetailComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'profile', component: ProfileComponent  },
  { path: 'payments', component: PaymentsComponent  },
  { path: 'management', component: ManagementComponent, canActivate: [AuthGuard]  },
  { path: '**', redirectTo: '/home' }, // ถ้าเส้นทางไม่ถูกต้อง, จะเปลี่ยนไปที่ Home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
