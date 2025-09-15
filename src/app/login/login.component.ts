import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';
  loginForm: FormGroup;

  // Definiši svoj email i password ovde
  private readonly ADMIN_EMAIL = 'milos@gmail.com';
  private readonly ADMIN_PASSWORD = 'Test123';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Simulacija API poziva
    setTimeout(() => {
      this.isLoading = false;

      const { email, password } = this.loginForm.value;
      
      // Proveri da li se podaci poklapaju sa tvojim
      if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
        // Generiši jedinstveni identifikator (ili koristi neki postojeći)
        const adminToken = this.generateAdminToken(email);
        
        // Sačuvaj u localStorage
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_token', adminToken);
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        console.log('Admin uspešno ulogovan:', { email, token: adminToken });
        
        // Preusmeri na rutu za kreiranje postova ili admin panel
        this.router.navigate(['/post/']); // ili gde god želiš
      } else {
        this.errorMessage = 'Pogrešan email ili lozinka.';
      }
    }, 1000);
  }

  // Generiši jednostavan token na osnovu email-a i vremena
  private generateAdminToken(email: string): string {
    const timestamp = Date.now().toString();
    const baseString = email + timestamp + 'secret-salt';
    
    // Jednostavan hash (u produkciji koristi pravu hash funkciju)
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `admin_${Math.abs(hash).toString(16)}_${timestamp}`;
  }

  // Logout funkcija (možeš je pozvati iz bilo kog dela aplikacije)
  static logout(): void {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_login_time');
  }

  // Proveri da li je admin ulogovan (statična metoda za lakše korišćenje)
  static isAdminAuthenticated(): boolean {
    return localStorage.getItem('admin_authenticated') === 'true';
  }

  // Dobij admin email
  static getAdminEmail(): string | null {
    return localStorage.getItem('admin_email');
  }

  // Dobij admin token
  static getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}