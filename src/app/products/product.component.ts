import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs, { EmailJSResponseStatus, send } from 'emailjs-com';

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
  productType: string;
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
  showHoroscopeModal: boolean = false;

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
    productType: '',
    message: ''
  };

  addToCart(product: Product) {
    this.cartItems.push({ ...product });
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

  submitCartItems() {
    if (this.cartItems.length > 0) {

      //this.sendEmail(this.contactForm);

      this.contactForm = {
        name: '',
        email: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        productType: '',
        message: ''
      };
    }
  }

  sendEmail(contactForm: ContactForm) {
    emailjs.send(
      'service_0l30jep',
      'template_tau0io5',
      {
        to_name: 'Vanja Ivanovic',
        to_email: 'ivanovicvanja355@yahoo.com',
        from_name: contactForm.name,
        from_email: contactForm.email,
        //birth_date: contactForm.birthDate,
        //birth_time: contactForm.birthTime,
        //birth_place: contactForm.birthPlace,
        productType: contactForm.productType,
        message: contactForm.message
      },
      'mzJxvFV2wfA985nV3'
    )
      .then((response: EmailJSResponseStatus) => {
        console.log('Uspešno poslato!', response.status, response.text);
      })
      .catch((err) => {
        console.error('Greška:', err);
      });
  }

  // NOVE METODE za modal
  openHoroscopeModal() {
    this.showHoroscopeModal = true;
  }

  closeHoroscopeModal() {
    this.showHoroscopeModal = false;
  }

  submitContactForm() {
    if (this.isFormValid()) {
      // Dodajte horoskop u korpu
      this.addToCart(this.products[1]); // Personalizovani horoskop      
  
      // Resetuj formu
      this.contactForm = {
        name: '',
        email: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        productType: 'natal',
        message: ''
      };
      
      // Zatvori modal
      this.closeHoroscopeModal();
    }
  }
}