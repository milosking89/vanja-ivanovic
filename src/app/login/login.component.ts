import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// Direktan Firebase import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
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
      username: ['', [Validators.required, Validators.minLength(3)]],
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

  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;
    console.log('Trying to login with:', { username, password });

    try {
      // Proveri da li postoje i username i password u login kolekciji
      const user = await this.checkCredentialsInFirestore(username, password);
      
      if (user) {
        // Kredencijali su validni
        const adminToken = this.generateAdminToken(username);
        
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_token', adminToken);
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_login_time', new Date().toISOString());
        
        this.showSuccessMessage("Uspešno ste se ulogovali!");
        
        setTimeout(() => {
          this.router.navigate(['/create/']);
        }, 1000);
        
      } else {
        this.errorMessage = 'Pogrešan username ili password.';
        alert(this.errorMessage);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Greška pri povezivanju sa bazom.';
    } finally {
      this.isLoading = false;
    }
  }

  // Proveri da li postoje username i password u login kolekciji
  private async checkCredentialsInFirestore(username: string, password: string): Promise<any> {
    if (!this.db) {
      console.error('Database not initialized');
      return null;
    }

    try {
      console.log('Checking Firestore for credentials:', { username, password });
      
      const loginRef = collection(this.db, 'login');
      
      // Opcija 1: Query sa where clause (efikasniji način)
      const q = query(
        loginRef, 
        where('username', '==', username),
        where('password', '==', password)
      );
      
      const snapshot = await getDocs(q);
      
      console.log('Found matching documents:', snapshot.size);
      
      if (!snapshot.empty) {
        // Pronađen je korisnik sa ovim kredencijalima
        const userDoc = snapshot.docs[0];
        console.log('User found:', userDoc.data());
        return userDoc.data();
      }
      
      // Opcija 2: Alternativa - učitaj sve i proveri ručno
      // (koristi ovu opciju ako Firestore indeksi nisu postavljeni)
      /*
      const allDocsSnapshot = await getDocs(loginRef);
      
      console.log('Total documents in login collection:', allDocsSnapshot.size);
      
      let foundUser = null;
      
      allDocsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Checking document:', data);
        
        if (data['username'] === username && data['password'] === password) {
          foundUser = data;
          console.log('Credentials match found!');
        }
      });
      
      return foundUser;
      */
      
      return null;
      
    } catch (error) {
      console.error('Firestore error:', error);
      
      // Ako query sa where ne radi, probaj sa drugom opcijom
      if (error instanceof Error && error.message.includes('index')) {
        console.warn('Firestore index missing, trying alternative method...');
        
        try {
          const loginRef = collection(this.db, 'login');
          const allDocsSnapshot = await getDocs(loginRef);
          
          let foundUser = null;
          
          allDocsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data['username'] === username && data['password'] === password) {
              foundUser = data;
            }
          });
          
          return foundUser;
        } catch (innerError) {
          console.error('Alternative method also failed:', innerError);
          return null;
        }
      }
      
      return null;
    }
  }

  private showSuccessMessage(message: string) {
    if (!this.isBrowser) return;
    
    const toast = document.createElement('div');
    toast.innerHTML = `✨ ${message} ✨`;
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

  // Generiši jednostavan token na osnovu username-a i vremena
  private generateAdminToken(username: string): string {
    const timestamp = Date.now().toString();
    const baseString = username + timestamp + 'secret-salt';
    
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
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_login_time');
  }

  // Proveri da li je admin ulogovan (statična metoda za lakše korišćenje)
  static isAdminAuthenticated(): boolean {
    return localStorage.getItem('admin_authenticated') === 'true';
  }

  // Dobij admin username
  static getAdminUsername(): string | null {
    return localStorage.getItem('admin_username');
  }

  // Dobij admin token
  static getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}