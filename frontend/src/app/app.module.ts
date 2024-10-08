import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
// ตรวจสอบให้แน่ใจว่าเส้นทางของ HomeComponent และ component อื่นๆ ถูกต้อง
import { HomeComponent } from './home/home.component'; 
import { LoginComponent } from './login/login.component';
import { BookingComponent } from './booking/booking.component';
import { DocumentsComponent } from './documents/documents.component';
import { ContactComponent } from './contact/contact.component';
import { ManagementComponent } from './management/management.component';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    BookingComponent,
    DocumentsComponent,
    ContactComponent,
    ManagementComponent,
    RegisterComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration() // สำหรับการ hydrate ฝั่ง client
  ],
  bootstrap: [AppComponent] // ประกาศให้ AppComponent เป็น component หลัก
})
export class AppModule { }
