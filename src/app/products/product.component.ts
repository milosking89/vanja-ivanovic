import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface ContactForm {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  consultationType: string;
  message: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductsComponent {
  cartItems: Product[] = [];
  
  products: Product[] = [
    {
      id: 1,
      name: 'Magične Sveće sa Kristalima',
      price: 2500,
      description: 'Ručno pravljene sveće obogaćene kristalima'
    },
    {
      id: 2,
      name: 'Personalizovani Mesečni Horoskop',
      price: 1800,
      description: 'Detaljni mesečni horoskop napisan posebno za vas'
    }
  ];

  contactForm: ContactForm = {
    name: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    consultationType: 'natal',
    message: ''
  };

  addToCart(product: Product) {
    this.cartItems.push({...product});
    alert(`✨ ${product.name} je dodato u korpu! ✨`);
  }

  removeFromCart(product: Product) {
    const index = this.cartItems.findIndex(item => item.id === product.id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price, 0);
  }

  isFormValid(): boolean {
    return !!(this.contactForm.name && 
             this.contactForm.email && 
             this.contactForm.birthDate && 
             this.contactForm.birthPlace);
  }

  submitContactForm() {
    if (this.isFormValid()) {
      alert(`🌟 Zahtev poslat! 🌟\n\nHvala ${this.contactForm.name}!\nKontaktiraću vas uskoro na ${this.contactForm.email} sa detaljima o ${this.getConsultationTypeName()}.`);
      
      this.contactForm = {
        name: '',
        email: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        consultationType: 'natal',
        message: ''
      };
    }
  }

  private getConsultationTypeName(): string {
    const types: {[key: string]: string} = {
      'natal': 'natalnoj karti',
      'synastry': 'sinastiji',
      'transit': 'tranzitnoj analizi',
      'solar': 'solarnoj revoluciji'
    };
    return types[this.contactForm.consultationType] || 'konsultaciji';
  }
}