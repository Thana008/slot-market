import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module'; // นำเข้า AppModule ฝั่ง client
import { AppComponent } from './app.component'; // นำเข้า AppComponent 

@NgModule({
  imports: [
    AppModule, // ใช้โมดูลเดียวกันทั้ง client และ server
    ServerModule, // ใช้สำหรับ server-side rendering
  ],
  bootstrap: [AppComponent], // ประกาศ AppComponent เป็น component หลัก
})
export class AppServerModule {}
