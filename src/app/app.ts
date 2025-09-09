import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('astrology-site');

  isMobileMenuOpen = false; // 👈 DODAJTE OVO
  
  // Postojeće navigate funkcije...
  
  toggleMobileMenu() { // 👈 DODAJTE OVO
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu() { // 👈 I OVO
    this.isMobileMenuOpen = false;
  }
}
