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
  loginForm: FormGroup;  // samo deklaracija

  constructor(private fb: FormBuilder, private router: Router) {
    // inicijalizacija forme u konstruktoru
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // getter za lakši pristup kontrolama
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

    // simulacija API poziva (1 sekunda)
    setTimeout(() => {
      this.isLoading = false;

      const { email, password } = this.loginForm.value;
      if (email === 'test@test.com' && password === '123456') {
        this.router.navigate(['/home']); // preusmeri na /home
      } else {
        this.errorMessage = 'Pogrešan email ili lozinka.';
      }
    }, 1000);
  }
}
