import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// Direktan Firebase import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { environment } from '../../environments/environment';

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

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  firebaseStatus = 'Loading...';
  isBrowser = false;
  private db: any;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      try {
        const app = initializeApp(environment.firebaseConfig);
        this.db = getFirestore(app);
        this.firebaseStatus = 'Connected';
        console.log('Firebase connected successfully');
      } catch (error) {
        console.error('Firebase error:', error);
        this.firebaseStatus = 'Error: ' + error;
      }
    }
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    console.log('Trying to login with password:', password);

    try {
      // Proveri da li postoji password "123456" u login kolekciji
      const isValidPassword = await this.checkPasswordInFirestore(password);
      
      if (isValidPassword) {
        // Password postoji u bazi
        const adminToken = this.generateAdminToken(email);
        
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_token', adminToken);
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        this.showSuccessMessage("Uspešno ste se ulogovali!");
        
        setTimeout(() => {
          this.router.navigate(['/post/']);
        }, 1000);
        
      } else {
        this.isLoading = false;
        this.errorMessage = 'Pogrešan password.';
      }
      
    } catch (error) {
      this.isLoading = false;
      console.error('Login error:', error);
      this.errorMessage = 'Greška pri povezivanju sa bazom.';
    }
    
    this.isLoading = false;
  }

  // Proveri da li postoji password u login kolekciji
  private async checkPasswordInFirestore(password: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      console.log('Checking Firestore for password:', password);
      
      const loginRef = collection(this.db, 'login');
      const snapshot = await getDocs(loginRef);
      
      console.log('Found documents in login collection:', snapshot.size);
      
      // Proveri da li neki dokument ima password "123456"
      let passwordExists = false;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document data:', data);
        
        if (data['password'] === password) {
          passwordExists = true;
          console.log('Password match found!');
        }
      });
      
      return passwordExists;
      
    } catch (error) {
      console.error('Firestore error:', error);
      return false;
    }
  }

  private showSuccessMessage(message:string) {
    if (!this.isBrowser) return;
    
    const toast = document.createElement('div');
    toast.innerHTML = '✨ Uspešno ste se ulogovali! ✨';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #4CAF50, #45a049);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
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